import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import Stripe from "stripe"
import { query as q } from "faunadb";
import { fauna } from "../../services/fauna"
import { stripe } from "../../services/stripe"
import { saveSubscription } from "./_lib/manageSubscription"
import Cors from 'micro-cors'
const cors = Cors({
  allowMethods: ['POST', 'HEAD']
})

async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false,
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

const webhooks = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      await fauna.query(
        q.Create(
          q.Collection('failedConstruct'),
          {
            data: {
              secret,
              buf,
              headers: req.headers,
              env: process.env.STRIPE_WEBHOOK_SECRET
            }
          }
        )
      )
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    const { type } = event

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )
            break
          case 'checkout.session.completed':

            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break
          default:
            throw new Error('Unhandled event.')
        }
      } catch (err) {
        return res.json({ error: 'Webhook handler failed.' })
      }
    }

    res.status(200).json({ ok: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}

export default cors(webhooks as any)