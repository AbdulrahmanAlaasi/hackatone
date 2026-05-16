# Hackatone User Flows

This document describes the main Hackatone user flows for web, mobile, dashboard, QR check-in, teams, submissions, judging, and results.

---

# 1. Organizer Creates a Hackathon

Actor: Organization owner or organizer/admin

1. Organizer logs into `/dashboard`.
2. Organizer selects `Create Hackathon`.
3. Organizer enters:
   - Name.
   - Description.
   - Dates.
   - Location.
   - Registration deadline.
   - Team size rules.
   - Tracks/categories.
   - Judging criteria.
   - Score range.
   - Submission deadline.
4. Organizer chooses team formation mode:
   - Organizer assigns teams.
   - Participants create teams.
   - Participants join by team code.
   - Participants join by invite link.
   - Solo allowed or not allowed.
5. Organizer saves hackathon as draft or publishes registration.
6. System creates:
   - Hackathon record.
   - Public registration slug.
   - Registration QR code.
   - Default judging criteria if none are customized.

Success state:

- Hackathon appears in dashboard.
- Organizer can copy registration link and download/share QR code.

---

# 2. Participant Registers from QR / Link

Actor: Participant

1. Participant scans registration QR or opens registration link.
2. Browser opens:

```text
https://hackatone.alaasi.dev/register/[hackathon-slug]
```

3. Page shows hackathon name, organizer, dates, registration deadline, and form.
4. Participant enters:
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
5. Participant submits form.
6. System creates or links participant profile by email.
7. System creates registration with status `pending`.
8. Success page tells participant:
   - Registration received.
   - Organizer must accept registration.
   - Download/open Hackatone mobile app.
   - Sign in using the same email.

Success state:

- Participant is visible in dashboard as `pending`.
- Participant can sign into app but sees pending status until accepted.

---

# 3. Organizer Accepts or Rejects Participant

Actor: Organization owner or organizer/admin

1. Organizer opens hackathon participants page.
2. Organizer filters by `Pending`.
3. Organizer opens participant profile.
4. Organizer clicks `Accept` or `Reject`.
5. System updates registration status.
6. System creates participant check-in token if accepted.
7. System sends email/push notification if configured.

Success state:

- Accepted participant sees hackathon in app.
- Rejected participant sees status but cannot access event content.

---

# 4. Participant Continues in Mobile App

Actor: Participant

1. Participant opens Hackatone mobile app.
2. Participant signs in with same email used for registration.
3. App loads registrations linked to the email/user.
4. App shows:
   - Pending hackathons.
   - Accepted hackathons.
   - Rejected hackathons.
5. Participant opens accepted hackathon.
6. App shows:
   - Event details.
   - Schedule.
   - Team status.
   - QR code.
   - Announcements.
   - Submission status.

Success state:

- Participant can access only hackathons they registered for and were accepted into.

---

# 5. Event Check-In

Actor: Organizer/admin and participant

Preferred MVP method: Organizer scans participant QR.

1. Participant opens mobile app.
2. Participant opens `My QR Code`.
3. App shows QR code with:
   - Participant name.
   - Team name if assigned.
   - Hackathon name.
4. Organizer opens dashboard check-in scanner.
5. Organizer scans participant QR.
6. System validates token.
7. System checks:
   - Token exists.
   - Token belongs to current hackathon.
   - Participant is accepted.
   - Participant is not already checked in.
8. System marks participant as checked in.
9. Dashboard updates check-in count.

Manual fallback:

1. Organizer searches participant by name/email/team.
2. Organizer clicks `Check in manually`.
3. System records manual check-in and actor ID.

Success state:

- Participant registration has `checked_in_at`.
- Check-in event is stored in audit log.

---

# 6. Team Formation

Actor: Participant or organizer/admin depending on hackathon settings

## Mode A: Organizer Assigns Teams

1. Organizer opens Teams page.
2. Organizer creates team.
3. Organizer assigns accepted participants to team.
4. Participants see assigned team in app.

## Mode B: Participant Creates Team

1. Participant opens Team screen.
2. Participant clicks `Create Team`.
3. Participant enters team name and track.
4. System creates team and makes participant team leader.
5. Participant shares team code if joining by code is enabled.

## Mode C: Join by Team Code

1. Participant enters team code.
2. System validates:
   - Team belongs to same hackathon.
   - Team is not full.
   - Participant is accepted.
3. Participant joins team.

## Mode D: Invite Link

1. Team leader generates invite link.
2. Participant opens invite link.
3. System validates eligibility.
4. Participant joins team.

Success state:

- Each participant is in a valid team or marked solo if solo is allowed.

---

# 7. Team Chat

Actor: Team members

1. Participant opens Team screen.
2. Participant taps `Chat`.
3. App loads messages for participant's team.
4. Participant sends message.
5. Message appears for all team members in realtime.

Rules:

- Only team members can access team chat.
- Organizer/admin may moderate or view chat if configured.
- Messages store sender, team, hackathon, body, and timestamp.

Success state:

- Team members can communicate in the app.

---

# 8. Hackathon Chat

Actor: Accepted participants

1. Participant opens hackathon chat if enabled.
2. App loads messages for the hackathon.
3. Participant sends message.
4. Message appears to accepted participants in same hackathon.

Rules:

- Must be accepted into the hackathon.
- Organizer/admin can disable chat.
- Future moderation/reporting can be added.

Success state:

- Participants in the same hackathon can communicate.

---

# 9. Project Submission

Actor: Team leader or team member with permission

1. Participant opens mobile app.
2. Participant opens accepted hackathon.
3. Participant opens Team or Submission screen.
4. Participant enters:
   - Project title.
   - Short description.
   - Track/category.
   - GitHub link.
   - Demo link.
   - Presentation link.
   - Video link.
   - Screenshots.
5. Participant submits project.
6. System validates:
   - Participant is accepted.
   - Participant belongs to team or is solo.
   - Deadline is open or organizer reopened submissions.
   - Required fields are present.
7. Submission appears in dashboard.
8. Submission appears in each team member's app.

Editing:

- Team can edit until deadline.
- Organizer can reopen submissions.

Success state:

- Dashboard and mobile app show the same latest submission.

---

# 10. Judge Scores Project

Actor: Judge

1. Judge logs into web dashboard or judge view.
2. Judge opens assigned hackathon.
3. Judge sees projects they are assigned to score.
4. Judge opens submission.
5. Judge scores each criterion.
6. Judge adds optional comment.
7. Judge saves draft or submits final score.
8. System calculates weighted/average score.

Success state:

- Score is stored.
- Scoring progress updates.
- Organizer can view score table.

---

# 11. Organizer Publishes Leaderboard

Actor: Organization owner or organizer/admin

1. Organizer opens Scoring/Results page.
2. Organizer reviews scores.
3. System applies tie breakers:
   - Total score.
   - Impact/usefulness score.
   - Manual organizer decision.
4. Organizer selects winners if manual adjustment is needed.
5. Organizer clicks `Publish Results`.
6. Leaderboard becomes visible.

Success state:

- Participants can see results in app.
- Public route can show leaderboard if enabled.

---

# 12. Announcement Flow

Actor: Organizer/admin

1. Organizer opens Announcements page.
2. Organizer writes message.
3. Organizer chooses audience:
   - All accepted participants.
   - Pending participants.
   - Specific teams.
   - Judges.
4. Organizer publishes announcement.
5. System stores announcement.
6. System sends push/email if configured.
7. App displays announcement.

Success state:

- Targeted users see the announcement.

