import Image from 'next/image'
import Link from 'next/link'

import { SignInButton } from '../SignInButton'
import logoIgNews from '../../../public/images/logo.svg'

import styles from './styles.module.scss'
import { useRouter } from 'next/dist/client/router'
import { ActiveLink } from '../ActiveLink'

export function Header() {
  const { asPath } = useRouter()


  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <picture className={styles.headerImage}>
          <Image src={logoIgNews} alt="ig.news" />
        </picture>
        <nav>
          <ActiveLink href="/" activeClassName={styles.active}>
            <a className={styles.active}>Home</a>
          </ActiveLink>
          <ActiveLink href="/posts" activeClassName={styles.active}>
            <a>Post</a>
          </ActiveLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}
