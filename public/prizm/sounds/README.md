# Prizm Lounge Sound Files

Place the following audio files in this directory for notification and timer sounds:

## Required Files

| File | Purpose | Recommended |
|------|---------|-------------|
| `notification.mp3` | Rotation alerts, PR call reminders | Short chime, 1-2 seconds |
| `timer-complete.mp3` | Timer countdown finished | Completion tone, 2-3 seconds |
| `warning.mp3` | 1-minute warning sound | Alert tone, 1 second |
| `tick.mp3` | Optional: countdown tick | Soft click, < 0.5 second |

## Specifications

- Format: MP3 (best compatibility)
- Quality: 128kbps or higher
- Volume: Normalized to -12dB
- Duration: Keep under 3 seconds for alerts

## Free Sound Resources

- [Freesound.org](https://freesound.org) - CC licensed sounds
- [Zapsplat](https://zapsplat.com) - Free sound effects
- [Mixkit](https://mixkit.co/free-sound-effects/) - Free notification sounds

## Usage in App

Sounds are triggered by:
1. `NotificationProvider.tsx` - Rotation alerts
2. `timer/page.tsx` - Timer completion
3. Header notification toggle

If files are missing, the app will silently fail (no errors).
