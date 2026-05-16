# Hackatone App Specification

Hackatone is a mobile and web platform that helps organizations create hackathons, manage registration, check participants in with QR codes, collect submissions, judge projects, publish results, and support communication between participants, teams, judges, and organizers.

This specification is based on `HACKATONE_QA.md` and should be used together with `DESIGN.md`.

---

# 1. Product Summary

## Product Name

Hackatone

## One-Sentence Description

Hackatone is a mobile and web platform that helps organizations create hackathons, manage registration, check participants in with QR codes, collect team submissions, enable judges to score projects, support participant/team communication, and publish leaderboards and winners.

## Main Goal

Build a working platform that can run a small hackathon end-to-end:

1. Organization creates a hackathon.
2. Organization generates a registration link and QR code.
3. Participant registers on a simple web page.
4. Participant continues in the mobile app using the same email.
5. Organizer accepts/rejects participant.
6. Participant gets access to the hackathon in the app if accepted.
7. Team is created or assigned based on organizer settings.
8. Participants can chat within their team or hackathon.
9. Team submits a project from the mobile app.
10. Judges score assigned projects.
11. Organizer publishes leaderboard and winners.

## Scope Reality Note

The final product can include all requested features, but a polished production-grade version cannot realistically be built in two days. For a two-day demo, build a complete vertical slice with the core flow working:

- Create hackathon.
- Generate registration link and QR.
- Register participant.
- Accept participant.
- Show accepted hackathon in mobile app.
- Generate participant/team QR.
- Check in participant.
- Assign/create team.
- Submit project.
- Judge project.
- Publish leaderboard.

Advanced polish, real app store release, push notifications, email deliverability, complex role permissions, and production-grade chat should be treated as post-demo hardening tasks.

---

# 2. User Roles

## Platform Admin

Can do everything across the platform.

Permissions:

- Manage all organizations.
- View all hackathons.
- Manage users and roles.
- Access system-level settings.
- Resolve account or data issues.

## Organization Owner

Owns an organization workspace.

Permissions:

- Manage organization profile.
- Add/remove organization members.
- Invite other organizations into the workspace if needed.
- Create and manage hackathons.
- Configure team rules, judging rules, registration fields, and visibility settings.
- Accept/reject participants.
- Publish results.

## Organizer / Admin

Works under an organization workspace.

Permissions:

- Manage assigned hackathons.
- Manage participants.
- Manage teams.
- Manage check-in.
- Manage submissions.
- Send announcements, emails, and push notifications.
- View dashboards and analytics.

## Judge

Scores projects in hackathons they are assigned to.

Permissions:

- View assigned hackathons.
- View assigned submissions.
- Score projects using configured criteria.
- Add comments.
- See scoring progress.

## Participant

Registers for hackathons and participates through the mobile app.

Permissions:

- Register through public web page.
- View accepted hackathons in mobile app.
- View schedule, announcements, and event details.
- View own/team QR code.
- Join/create team if allowed.
- Chat with team members and allowed hackathon channels.
- Submit project through mobile app.
- View published leaderboard and winners.

## Mentor

Optional future role.

Permissions:

- View assigned hackathons.
- View teams.
- Chat with participants if enabled.
- Provide non-scoring feedback.

## Public Viewer

Can view public results and project gallery after organizer publishes them.

Permissions:

- View public leaderboard.
- View published project gallery.
- Cannot see private participant contact details.

---

# 3. Platform Structure

Hackatone uses a workspace model:

- Each organization has its own workspace.
- Each organization can create multiple hackathons.
- Organization owners may optionally allow other organizations to collaborate inside their workspace.
- Participants can register for multiple hackathons using the same account/email.
- A participant only sees hackathons they registered for and were accepted into.
- Data access is scoped by organization and hackathon.

---

# 4. Core Features

## 4.1 Organization Dashboard

Dashboard pages:

- Dashboard home.
- Hackathons list.
- Hackathon details.
- Participants.
- Teams.
- Submissions.
- Judges.
- Scoring/results.
- QR codes/check-in.
- Announcements.
- Chat moderation.
- Settings.

Dashboard requirements:

- Beautiful and user-friendly interface.
- Warm, rounded design from `DESIGN.md`.
- Clear tables with filters/search.
- KPI cards for registration, acceptance, check-in, submissions, judging progress.
- Role-based access.
- Mobile responsive, but optimized for desktop/tablet.

## 4.2 Hackathon Creation

Hackathon fields:

- Hackathon name.
- Description.
- Start date.
- End date.
- Location.
- Registration deadline.
- Maximum participants.
- Minimum team size.
- Maximum team size.
- Tracks/categories.
- Rules.
- Prizes.
- Judging criteria.
- Score range.
- Minimum passing score.
- Team formation mode.
- Registration status.
- Submission deadline.
- Leaderboard visibility.

Team formation modes:

- Organizer assigns teams.
- Participants create teams.
- Participants join by team code.
- Participants join by invite link.
- Solo participants allowed or not allowed.

## 4.3 Public Registration Web Page

Every hackathon generates:

- Public registration URL.
- Registration QR code.

Example route:

```text
https://hackatone.alaasi.dev/register/[hackathon-slug]
```

Registration fields:

- Full name.
- Email.
- Phone number.
- University/company.
- Major/job title.
- Skill level.
- Skills.
- Preferred track.
- GitHub/portfolio link.
- Team preference.

Registration behavior:

- Participant can register without creating a password.
- Participant is created or linked by email.
- Registration status begins as `pending`.
- Organizer/admin can accept or reject participant.
- Participant receives acceptance/rejection status in mobile app after signing in.

After registration:

1. Show success page.
2. Confirm registration was received.
3. Explain that access depends on organizer acceptance.
4. Ask participant to download/open the mobile app.
5. Tell participant to sign in using the same email.
6. Optional later: deep link directly into app.

## 4.4 QR Code System

Hackatone has two QR types:

### Registration QR

Purpose:

- Public QR that opens the web registration page for a specific hackathon.

Stored data:

- Hackathon ID.
- Organization ID.
- Public registration slug.

### Participant / Team Check-In QR

Purpose:

- Unique QR shown in the participant app after acceptance.
- Used for event check-in.
- Includes participant identity, team identity, and hackathon registration token.

Security:

- QR token must be random and non-guessable.
- Do not encode plain participant IDs as the only secret.
- Use a random token stored server-side.

Check-in:

- Organizer/admin scans participant QR.
- System validates token.
- System marks participant as checked in.
- Manual fallback: organizer searches name/email/team and clicks `Check in`.

MVP supports one main event check-in. Session/workshop check-ins can be added later.

## 4.5 Participant Mobile App

Recommended platform:

- Expo React Native.
- iOS and Android supported.
- Build Android first if needed, but Expo supports both.
- Use Expo Go for fast MVP testing.
- Use EAS/TestFlight later for iOS distribution.

Participant app screens:

- Login/signup.
- My hackathons.
- Hackathon details.
- Schedule.
- Acceptance status.
- My QR code.
- Team screen.
- Team chat.
- Hackathon participant chat if enabled.
- Project submission.
- Announcements.
- Profile.

Participant profile:

- Name.
- Email.
- Phone.
- University/company.
- Major/job title.
- Skills.
- GitHub/portfolio link.
- Bio.
- Avatar.

Rules:

- Participant signs in with the same email used for web registration.
- If accepted, registered hackathon appears in app.
- If pending, app shows pending status.
- If rejected, app shows rejection status without event access.

## 4.6 Team Management

Team size:

- Organization owner/admin sets minimum and maximum team size.

Team formation:

- Organization owner/admin chooses method:
  - Organizer assigns teams.
  - Team code.
  - Invite link.
  - Participant creates team.
  - Participant requests to join.

Solo participants:

- Allowed only if organization owner/admin allows solo participation.

Team features:

- Team profile.
- Team members.
- Team QR/check-in information.
- Team chat.
- Project submission status.
- Submission edit access before deadline.

## 4.7 Project Submission

Teams submit from the mobile app.

Submission fields:

- Project title.
- Short description.
- Track/category.
- GitHub link.
- Demo link.
- Presentation link.
- Video link.
- Screenshots.
- Team members.

Rules:

- Submission closes automatically after deadline.
- Organizer can reopen submissions manually.
- Teams can edit submission until deadline.
- Updated submission appears in dashboard and in every team member's project submission screen.

## 4.8 Judging and Scoring

Default criteria:

- Innovation.
- Technical implementation.
- Design/user experience.
- Impact/usefulness.
- Presentation.

Organizer/admin can:

- Add criteria.
- Remove criteria.
- Edit criteria.
- Change score range.
- Set minimum passing score.
- Assign judges to hackathons.

Judges:

- Score projects in hackathons they are assigned to.
- Add comments.
- Save draft scores if needed.
- Submit final scores.

Default score range:

- `1` to `5` per criterion.

Leaderboard:

- Hidden until organization owner/admin publishes results.
- Once published, visible to participants and public viewers if public gallery is enabled.

Tie breaker:

1. Higher total score wins.
2. If tied, higher impact/usefulness score wins.
3. If still tied, organization owner/admin decides manually.

## 4.9 Announcements, Email, and Push Notifications

Announcements:

- Organizer/admin can post announcements.
- Announcements appear in organizer dashboard and participant mobile app.

Email:

- MVP should support sending emails to participants.
- Use transactional email provider later if needed.
- Email types:
  - Registration received.
  - Accepted/rejected.
  - Important organizer announcement.
  - Submission deadline reminder.
  - Results published.

Push notifications:

- Requested for MVP, but should be implemented after core app flow unless time allows.
- Push types:
  - Acceptance/rejection.
  - Announcement.
  - Deadline reminder.
  - Results published.

## 4.10 Chat

Chat requirements:

- Team members can chat with each other in a team chat.
- Participants can chat with other participants in the same hackathon if organizer enables hackathon chat.
- Judges may be included in specific channels if organizer enables judge/participant communication.

MVP recommendation:

- Implement team chat first.
- Add hackathon-wide chat second.
- Add judge communication later if needed.

Moderation:

- Organizer/admin can view or disable hackathon chat if needed.
- Basic abuse reporting can be future scope.

---

# 5. Web Routes

Public routes:

```text
/ 
/register/[hackathonSlug]
/registration-success
/leaderboard/[hackathonSlug]
/projects/[hackathonSlug]
```

Auth routes:

```text
/login
/signup
/forgot-password
```

Dashboard routes:

```text
/dashboard
/dashboard/hackathons
/dashboard/hackathons/new
/dashboard/hackathons/[id]
/dashboard/hackathons/[id]/participants
/dashboard/hackathons/[id]/teams
/dashboard/hackathons/[id]/submissions
/dashboard/hackathons/[id]/judges
/dashboard/hackathons/[id]/scoring
/dashboard/hackathons/[id]/leaderboard
/dashboard/hackathons/[id]/check-in
/dashboard/hackathons/[id]/qr-codes
/dashboard/hackathons/[id]/announcements
/dashboard/settings
```

---

# 6. Mobile Navigation

Participant app bottom navigation:

- Home.
- Events.
- QR.
- Team.
- Profile.

Inside active hackathon:

- Overview.
- Schedule.
- Team.
- Submission.
- Chat.
- Announcements.
- Results.

---

# 7. Data Privacy Rules

Private data:

- Email.
- Phone.
- Participant profile data.
- Internal judge comments if not published.
- Registration acceptance/rejection reasoning.

Public data after results are published:

- Published projects.
- Team names.
- Project descriptions.
- Project links.
- Leaderboard.
- Winner names/team names if organizer chooses to publish them.

Public data must not include:

- Participant phone numbers.
- Participant email addresses.
- Private organizer notes.

---

# 8. Acceptance Criteria

The MVP is successful when:

- Organizer can create a hackathon.
- Organizer can generate registration link and QR.
- Participant can register from web page.
- Organizer can accept/reject participant.
- Participant can sign into mobile app with same email.
- Accepted participant can see hackathon in mobile app.
- Participant can show unique QR code.
- Organizer can check in participant using QR or manual fallback.
- Organization team mode controls team behavior.
- Team can submit project from mobile app.
- Judge can score assigned projects.
- Organizer can publish leaderboard.
- Participants can see published results.
- Team members can chat with each other.

---

# 9. Future Features

Future features:

- AI project feedback.
- AI submission summaries.
- Certificates.
- Sponsor pages.
- Mentor matching.
- Advanced analytics.
- Arabic language support.
- App Store / Google Play release.
- Cloudflare Access for dashboard.
- Deep linking from registration success page into app.
- Session/workshop check-ins.
- Advanced chat moderation.
- Advanced email templates.
- Public project gallery with likes/comments.

