import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
const d = "What data the GiveawaySomething Discord bot and dashboard collect and how it is used.";
export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy — GiveawaySomething" }, { name: "description", content: d }, { property: "og:title", content: "Privacy Policy — GiveawaySomething" }, { property: "og:description", content: d }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <LegalPage title="Privacy Policy" updated="November 12, 2026" sections={[
    { h: "What we collect", p: "Discord user IDs, usernames and avatars when you log in; server and channel IDs; giveaway and drop details (prize, duration, winners); participant user IDs; and feedback you choose to send." },
    { h: "How we use it", p: "Only to run giveaways and drops, pick winners, show your servers in the dashboard, and improve the bot. We never sell your data or use it for advertising." },
    { h: "Discord login", p: "Login uses Discord OAuth. We only request access to your profile and server list, and your login tokens are stored encrypted on our servers, never in your browser." },
    { h: "Storage and retention", p: "Data is stored on secured servers. Giveaway data is kept while needed to run the giveaway and its history. Login sessions expire after 7 days." },
    { h: "Sharing", p: "We do not share data with third parties, except the hosting providers needed to run the service and Discord itself." },
    { h: "Your choices", p: "You can log out at any time, remove the bot from your server, or request deletion of your data through the Feedback button on the dashboard." },
    { h: "Changes", p: "We may update this policy; the date above shows the latest version." },
  ]} />,
});
