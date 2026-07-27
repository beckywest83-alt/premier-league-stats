import "./styles.css";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("Application root element was not found.");
}

app.innerHTML = `
  <section class="hero" aria-labelledby="page-title">
    <p class="eyebrow">Premier League</p>
    <h1 id="page-title">Stats that tell the story.</h1>
    <p class="intro">
      A new home for exploring the numbers behind England's top flight.
    </p>
  </section>
`;
