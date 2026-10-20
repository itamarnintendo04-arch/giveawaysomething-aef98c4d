# Tasks
- [ ] Add bot invitation for servers where it is absent and first-login onboarding persisted per Discord account.
- [ ] Add stored Feedback for feature suggestions, bugs, bot issues and user experience.
- [ ] Test invitation/feedback rules and verify the available live flows.
- [x] Implement real Discord servers and available channels with server-side authorization.
- [x] Replace simulated launch confirmations with honest connection states.
- [ ] Connect creation, active giveaway/drop lists, details, counts, ending and participant removal — blocked on the user's existing bot source code.
- [x] Verify authorization tests, public login interface and rejection of invalid OAuth state (7 tests passed).
- [ ] Verify server/channel selection inside a real Discord account — blocked on an active Discord login; Cloud sessions cannot substitute for Discord OAuth.