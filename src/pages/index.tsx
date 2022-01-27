import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import avatarSvg from '../../public/images/avatar.svg'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'
import styles from './home.module.scss'

interface HomeProps {
  produtc: {
    priceId: string;
    amount: string;
  }
}

export default function Home({ produtc }: HomeProps) {
  return (
    <>
      <Head>
        <title>Início | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span> 👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {produtc.amount} month</span>
          </p>
          <SubscribeButton priceId={produtc.priceId} />
        </section>
        <picture className={styles.girlImage} >
          <Image src={avatarSvg} alt="Girl coding" />
        </picture>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1J4WiULPtX1ZOuIuMo6AIX0r', {
    expand: ['product']
  })

  const produtc = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100)
  }

  return {
    props: {
      produtc
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}