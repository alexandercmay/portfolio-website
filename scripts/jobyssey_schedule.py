#!/usr/bin/env python3
"""Generate the Jobyssey week-1 schedule in a dedicated macOS Calendar.

Week window: Tue 2026-09-08 (partial setup day) through Tue 2026-09-15.
This week only: Sat 2026-09-12 is off, Fri 2026-09-11 stops at 16:00.
Neither is a recurring rule -- future weeks treat Fri/Sat as normal.

Usage:
    python3 scripts/jobyssey_schedule.py            # add events
    python3 scripts/jobyssey_schedule.py --clear    # wipe calendar first, then add
    python3 scripts/jobyssey_schedule.py --print    # dump the AppleScript, do nothing

--clear deletes EVERY event on the calendar, including any you added by hand.
"""

import subprocess
import sys

CALENDAR = "The Jobyssey"
LOCATION = "Study location"
YEAR = 2026

# What each block is FOR. This string becomes the event's notes, so it shows up
# every time the block starts. Keep each to one or two plain sentences -- a
# concrete "definition of done" you can hold yourself to, not a vague theme.
#
# TODO(human): fill in the empty strings below. Two are done as examples.
# Avoid straight double-quotes in the text (apostrophes are fine).
BLOCK_NOTES = {
    "Technical Practice": "Practice Leet Code Style Problems. Pencil and Paper.",
    "System Design Practice": "Practice system design style questions. Use AI to grade you.",
    "Applications": "Submit applications for jobs.",
    "Networking": "Connect with people on LinkedIn, find networking events to go to, or message people.",
    "OSS Development": "Work on developing some OSS features. This can include time needed to learn about the discipline.",
    "Behavioral Practice": "Practice and research behavioral interview questions.",
    "Resume Review": "Go through existing items in your resume and make sure you can answer any potential questions.",
    "Weekly Review": "End with a written pipeline snapshot (apps out, responses, interviews booked) and three concrete targets for next week.",
    "Open Block": "Unassigned time. Point it at whatever needs it today -- overflow from an earlier block, a deeper dive, or prep for tomorrow. If nothing is pressing, take it back.",
}

# Blocks that are rest, not work: no location, no notes.
REST_BLOCKS = {"Break", "Lunch", "Dinner"}


def full_day(late_morning, pre_dinner):
    """Standard block day: ~8h20m of fixed blocks plus a post-dinner Open Block
    you assign yourself. `late_morning` is System Design or a 2nd Technical
    block; `pre_dinner` rotates Behavioral Practice / Resume Review.

    Applications and Networking are 25-min daily touchpoints -- real networking
    (events, calls) gets scheduled by hand as it comes up. Dinner is 2h to
    cover cooking / groceries / a wind-down before the evening block."""
    return [
        ("08:00", "10:00", "Technical Practice"),
        ("10:00", "10:15", "Break"),
        ("10:15", "11:45", late_morning),
        ("11:45", "12:30", "Lunch"),
        ("12:30", "12:55", "Applications"),
        ("12:55", "13:20", "Networking"),
        ("13:20", "13:30", "Break"),
        ("13:30", "16:30", "OSS Development"),
        ("16:30", "16:45", "Break"),
        ("16:45", "17:45", pre_dinner),
        ("17:45", "19:45", "Dinner"),
        ("19:45", "21:15", "Open Block"),
    ]


# (month, day) -> [(start "HH:MM", end "HH:MM", block name), ...]
SCHEDULE = {
    (9, 8): [  # today: half day, setup work, wherever you are
        ("13:30", "15:00", "Applications"),
        ("15:00", "15:15", "Break"),
        ("15:15", "16:45", "Networking"),
        ("16:45", "17:00", "Break"),
        ("17:00", "18:00", "Resume Review"),
    ],
    (9, 9): full_day("System Design Practice", "Resume Review"),
    (9, 10): full_day("Technical Practice", "Behavioral Practice"),
    (9, 11): [  # short day, hard stop at 16:00
        ("08:00", "10:00", "Technical Practice"),
        ("10:00", "10:15", "Break"),
        ("10:15", "12:00", "System Design Practice"),
        ("12:00", "12:45", "Lunch"),
        ("12:45", "14:15", "Applications"),
        ("14:15", "14:30", "Break"),
        ("14:30", "15:15", "Networking"),
        ("15:15", "16:00", "Weekly Review"),
    ],
    # 9/12 Saturday: off
    (9, 13): full_day("System Design Practice", "Resume Review"),
    (9, 14): full_day("Technical Practice", "Behavioral Practice"),
    (9, 15): full_day("System Design Practice", "Behavioral Practice"),
}


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def as_date(month, day, hhmm):
    hh, mm = (int(x) for x in hhmm.split(":"))
    return f"(my makeDate({YEAR}, {month}, {day}, {hh}, {mm}))"


def build_applescript():
    out = [
        "on makeDate(y, m, d, hh, mm)",
        "    set theDate to current date",
        "    set day of theDate to 1",
        "    set year of theDate to y",
        "    set month of theDate to m",
        "    set day of theDate to d",
        "    set hours of theDate to hh",
        "    set minutes of theDate to mm",
        "    set seconds of theDate to 0",
        "    return theDate",
        "end makeDate",
        "",
        'tell application "Calendar"',
        f'    tell calendar "{CALENDAR}"',
    ]
    for (month, day), blocks in SCHEDULE.items():
        for start, end, block in blocks:
            props = [
                f'summary:"{esc(block)}"',
                f"start date:{as_date(month, day, start)}",
                f"end date:{as_date(month, day, end)}",
            ]
            if block not in REST_BLOCKS:
                props.append(f'location:"{esc(LOCATION)}"')
                note = BLOCK_NOTES.get(block, "")
                if note:
                    props.append(f'description:"{esc(note)}"')
            out.append(f"        make new event with properties {{{', '.join(props)}}}")
    out += ["    end tell", "end tell"]
    return "\n".join(out)


def calendar_exists():
    r = subprocess.run(
        ["osascript", "-e", f'tell application "Calendar" to (exists calendar "{CALENDAR}")'],
        capture_output=True, text=True,
    )
    return r.stdout.strip() == "true"


def main():
    if "--print" not in sys.argv and not calendar_exists():
        print(
            f'No calendar named "{CALENDAR}". Create it first in Calendar.app\n'
            f'(File > New Calendar > iCloud, name it "{CALENDAR}"), then re-run.\n'
            f"This script only adds events; it will not create the calendar,\n"
            f"so it can't accidentally make a non-syncing local one.",
            file=sys.stderr,
        )
        sys.exit(1)

    missing = [b for b, n in BLOCK_NOTES.items() if not n.strip()]
    if missing:
        print("Block notes still empty: " + ", ".join(missing), file=sys.stderr)
        print("Fill in BLOCK_NOTES before running, or pass --force to proceed anyway.", file=sys.stderr)
        if "--force" not in sys.argv:
            sys.exit(1)

    script = build_applescript()
    if "--print" in sys.argv:
        print(script)
        return

    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
