import { FaSignOutAlt, FaSignInAlt } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'
import { signIn, signOut, useSession } from 'next-auth/client'

import styles from './styles.module.scss'

export function SignInButton() {
  const [session] = useSession()

  return session ? (
    <button
      className={styles.signInButton}
      type="button"
      onClick={() => signOut()}
    >
      <span >
        {session.user.name}
      </span>
      <FaSignOutAlt color="#737380" />
      {/* <FiX color="#737380" className={styles.closeIcon} /> */}
    </button>
  ) : (
    <button
      className={styles.signInButton}
      type="button"
      onClick={() => signIn()}
    >
      <FaSignInAlt color="#04d361" /> {/** color="#eba417" */}
      <span>
        Sign in
      </span>
    </button>
  )
}