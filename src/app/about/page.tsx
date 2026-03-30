import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "À Propos de KitchenLuxe | L'Excellence Culinaire",
  description: "Découvrez l'histoire de KitchenLuxe, notre passion pour la haute cuisine et notre engagement envers la qualité professionnelle pour votre domicile.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-header" style={{ background: "var(--color-black)", color: "white", padding: "8rem 0" }}>
          <div className="container">
            <span style={{ textTransform: "uppercase", letterSpacing: "5px", fontSize: "0.9rem", color: "var(--color-accent)" }}>Notre Héritage</span>
            <h1 style={{ color: "white", fontSize: "4rem", marginTop: "1rem" }}>KitchenLuxe™</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: "700px", margin: "2rem auto" }}>
              Redéfinir l&apos;art de vivre en cuisine à travers la performance et l&apos;élégance.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: "800px" }}>
            <div className="about-content">
              <h2>L&apos;Inspiration Professionnelle</h2>
              <p>
                KitchenLuxe est né d&apos;une observation simple : les passionnés de cuisine méritent des outils à la hauteur de leurs ambitions. Trop longtemps, la frontière entre l&apos;équipement professionnel et domestique a été infranchissable.
              </p>
              <p>
                Nous avons parcouru le monde pour sélectionner les artisans et les marques qui partagent notre vision. De la fonte émaillée française à l&apos;acier forgé allemand, chaque produit de notre collection est choisi pour sa durabilité, sa précision et son esthétique intemporelle.
              </p>

              <div style={{ margin: "4rem 0", padding: "3rem", background: "var(--color-light-grey)", borderLeft: "4px solid var(--color-accent)" }}>
                <p style={{ fontStyle: "italic", fontSize: "1.2rem" }}>
                  &quot;Une cuisine d&apos;exception ne commence pas par une recette, mais par le respect des ingrédients et de l&apos;outil qui les sublime.&quot;
                </p>
                <p style={{ marginTop: "1rem", fontWeight: "bold" }}>— La Brigade KitchenLuxe</p>
              </div>

              <h2>Notre Engagement</h2>
              <ul>
                <li><strong>Qualité Transpante :</strong> Nous detaillons chaque caractéristique technique pour vous aider à choisir l&apos;outil parfait.</li>
                <li><strong>Design Industriel-Luxe :</strong> Parce qu&apos;une cuisine doit être aussi belle que performante.</li>
                <li><strong>Innovation Barista :</strong> Nous transformons votre matinée avec des technologies d&apos;extraction de pointe.</li>
              </ul>

              <p style={{ marginTop: "3rem" }}>
                Rejoignez notre brigade de passionnés et transformez chaque repas en un moment d&apos;exception.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
