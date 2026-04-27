import Link from 'next/link'
import styles from '../legal.module.css'

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>← Retour à l&apos;accueil</Link>
      
      <div className={`glass-panel ${styles.card}`}>
        <h1 className={styles.title}>Conditions Générales d&apos;Utilisation</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Objet du Service</h2>
          <p className={styles.text}>
            OneView est une plateforme de livraison sécurisée de contenu vidéo. Notre service permet aux Créateurs de mettre à disposition des vidéos pour leurs Clients avec une restriction stricte de visionnage unique.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Règle du Visionnage Unique</h2>
          <p className={styles.text}>
            En utilisant OneView, le Client accepte les conditions suivantes :
          </p>
          <ul className={styles.list}>
            <li>L&apos;accès à une vidéo est strictement limité à une seule session de visionnage.</li>
            <li>Une fois la session terminée ou le navigateur fermé après le début de la lecture, le code d&apos;accès expire définitivement.</li>
            <li>Toute tentative de capture d&apos;écran, d&apos;enregistrement ou de téléchargement non autorisé est une violation des présentes conditions.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Propriété Intellectuelle</h2>
          <p className={styles.text}>
            Les Créateurs conservent l&apos;intégralité des droits de propriété intellectuelle sur les contenus téléchargés. OneView agit uniquement en tant que prestataire technique et n&apos;acquiert aucun droit de propriété sur vos vidéos.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Responsabilités</h2>
          <p className={styles.text}>
            Le Créateur est seul responsable du contenu qu&apos;il diffuse. Il s&apos;engage à ne pas publier de contenu illégal, diffamatoire ou violant les droits de tiers. OneView se réserve le droit de supprimer tout contenu ou compte ne respectant pas ces règles.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Modification des Conditions</h2>
          <p className={styles.text}>
            OneView se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des changements majeurs via la plateforme.
          </p>
        </section>
      </div>
    </div>
  )
}
