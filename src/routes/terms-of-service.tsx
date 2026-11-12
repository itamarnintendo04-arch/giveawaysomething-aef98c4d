import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
const d = "Terms for using the GiveawaySomething Discord bot and dashboard.";
export const Route = createFileRoute("/terms-of-service")({
  head: () => ({ meta: [{ title: "Terms of Service — GiveawaySomething" }, { name: "description", content: d }, { property: "og:title", content: "Terms of Service — GiveawaySomething" }, { property: "og:description", content: d }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <LegalPage title="Terms of Service" updated="November 12, 2026" sections={[
    { h: "Acceptance", p: "By adding GiveawaySomething to a Discord server or using its dashboard, you agree to these terms and to Discord's Terms of Service and Community Guidelines." },
    { h: "The service", p: "GiveawaySomething lets server managers run giveaways and quick drops. Winners are chosen randomly by the bot. The service is provided free and \"as is\", without guarantees of availability or uptime." },
    { h: "Your responsibilities", p: "Server managers are fully responsible for the prizes they offer and for delivering them. Do not use the bot for scams, gambling, illegal prizes, spam, or anything that breaks Discord rules." },
    { h: "Prizes", p: "GiveawaySomething does not provide, own, or guarantee any prize. Disputes about prizes are between the winner and the server that hosted the giveaway." },
    { h: "Termination", p: "We may block servers or users who abuse the bot. You can stop using it any time by removing the bot from your server." },
    { h: "Liability", p: "To the extent allowed by law, we are not liable for losses from using the bot, outages, or lost giveaway data." },
    { h: "Changes and contact", p: "We may update these terms; continued use means you accept the changes. Questions can be sent through the Feedback button on the dashboard." },
  ]} />,
});
