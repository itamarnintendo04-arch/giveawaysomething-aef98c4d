<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
 
Brand imagery uses an imported CDN asset pointer, while the browser favicon is a padded 64px local PNG because browsers require a directly served icon.

- Discord remains the account authority; authenticate every Discord data request with the signed HttpOnly session and verify guild management and effective channel permissions server-side, because browser-selected IDs are untrusted.
- Store encrypted Discord OAuth credentials in a service-role-only Cloud table referenced by the signed session; never expose provider tokens to the browser.
- Existing bot source/API is required before implementing giveaway/drop management, because Discord messages do not reliably expose the bot's internal participation and lifecycle state.
