import Link from 'next/link'
import styles from '../legal.module.css'

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>← Retour à l&apos;accueil</Link>
      
      <div className={`glass-panel ${styles.card}`}>
        <h1 className={styles.title}>Politique de Confidentialité</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Collecte des Données</h2>
          <p className={styles.text}>
            Dans le cadre de l&apos;utilisation de OneView, nous collectons les données suivantes :
          </p>
          <ul className={styles.list}>
            <li><strong>Identification :</strong> Votre adresse email pour la gestion de votre compte et la sécurité des accès.</li>
            <li><strong>Données d&apos;Usage :</strong> Historique de visionnage et état des codes d&apos;accès pour garantir le fonctionnement de la marketplace.</li>
            <li><strong>Contenu :</strong> Les métadonnées des vidéos que vous uploadez (titre, description).</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Utilisation des Données</h2>
          <p className={styles.text}>
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul className={styles.list}>
            <li>Fournir et maintenir le service de livraison vidéo.</li>
            <li>Assurer la sécurité des transactions entre Créateurs et Clients.</li>
            <li>Prévenir toute utilisation frauduleuse de la plateforme.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Stockage et Sécurité</h2>
          <p className={styles.text}>
            OneView utilise des partenaires technologiques de confiance pour le stockage de vos données :
          </p>
          <ul className={styles.list}>
            <li><strong>Supabase :</strong> Pour la base de données et l&apos;authentification (sécurisé via RLS).</li>
            <li><strong>Backblaze B2 :</strong> Pour le stockage sécurisé des fichiers vidéos (accès via URLs signées temporaires).</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Vos Droits</h2>
          <p className={styles.text}>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits directement depuis votre profil ou en nous contactant.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Cookies</h2>
          <p className={styles.text}>
            OneView utilise uniquement des cookies techniques essentiels au maintien de votre session d&apos;authentification. Nous n&apos;utilisons aucun cookie de traçage publicitaire tiers.
          </p>
        </section>
      </div>
    </div>
  )
}
