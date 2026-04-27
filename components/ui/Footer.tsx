import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <Image 
              src="/logo12.png" 
              alt="OneView" 
              width={240} 
              height={80} 
              className={styles.logo} 
            />
            <p className={styles.tagline}>La marketplace vidéo sécurisée</p>
          </div>
          
          <nav className={styles.nav}>
            <ul className={styles.list}>
              <li>
                <Link href="/terms" className={styles.link}>
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.link}>
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} OneView. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
