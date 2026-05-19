#!/usr/bin/env python3
"""Generate a bar chart of workouts per month for the past 12 months."""

import argparse
import os
import sys
from datetime import datetime, timezone
from collections import defaultdict

def parse_database_url(env_path):
    """Read DATABASE_URL from a .env file."""
    try:
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        print(f"Error: .env file not found at {env_path}", file=sys.stderr)
        sys.exit(1)
    print("Error: DATABASE_URL not found in .env file", file=sys.stderr)
    sys.exit(1)


def query_workouts(database_url):
    """Query workouts created in the past 12 months, return list of (year, month) tuples."""
    try:
        import psycopg2
    except ImportError:
        print("Error: psycopg2 is not installed. Run: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)

    sql = """
        SELECT DATE_TRUNC('month', created_at) AS month
        FROM workouts
        WHERE created_at >= NOW() - INTERVAL '12 months'
        ORDER BY month;
    """

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [row[0] for row in rows]
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)


def build_monthly_counts(rows):
    """Build an ordered dict of month_label -> count covering the past 12 months."""
    now = datetime.now(timezone.utc)

    # Build the full 12-month window so months with 0 workouts still appear
    months = []
    for i in range(11, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        months.append((year, month))

    counts = defaultdict(int)
    for row in rows:
        # row may be a datetime or date object
        key = (row.year, row.month)
        counts[key] += 1

    labels = []
    values = []
    for year, month in months:
        label = datetime(year, month, 1).strftime("%b %Y")
        labels.append(label)
        values.append(counts.get((year, month), 0))

    return labels, values


def plot_chart(labels, values, output_path):
    """Render and save the bar chart."""
    try:
        import matplotlib
        matplotlib.use("Agg")  # non-interactive backend, safe for scripts
        import matplotlib.pyplot as plt
    except ImportError:
        print("Error: matplotlib is not installed. Run: pip install matplotlib", file=sys.stderr)
        sys.exit(1)

    fig, ax = plt.subplots(figsize=(14, 6))
    bars = ax.bar(labels, values, color="#4f86c6", edgecolor="white", linewidth=0.5)

    # Annotate each bar with its count
    for bar, val in zip(bars, values):
        if val > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.1,
                str(val),
                ha="center",
                va="bottom",
                fontsize=9,
                color="#333333",
            )

    ax.set_xlabel("Month", fontsize=12)
    ax.set_ylabel("Number of Workouts", fontsize=12)
    ax.set_title("Workouts per Month (Past 12 Months)", fontsize=14, fontweight="bold")
    ax.set_ylim(0, max(values) + max(2, max(values) * 0.15) if any(values) else 5)
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.tight_layout()

    fig.savefig(output_path, dpi=150)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description="Plot monthly workout counts.")
    parser.add_argument("--env", default=".env", help="Path to the .env file")
    parser.add_argument("--output", default="workout_chart.png", help="Output PNG path")
    args = parser.parse_args()

    env_path = os.path.abspath(args.env)
    output_path = os.path.abspath(args.output)

    print(f"Reading DATABASE_URL from {env_path} ...")
    database_url = parse_database_url(env_path)

    print("Querying workouts for the past 12 months ...")
    rows = query_workouts(database_url)

    labels, values = build_monthly_counts(rows)
    total = sum(values)

    if total == 0:
        print("No workouts found in the past 12 months. Nothing to chart.")
        sys.exit(0)

    print(f"Found {total} workout(s) across {sum(1 for v in values if v > 0)} month(s).")
    print(f"Generating chart -> {output_path}")
    plot_chart(labels, values, output_path)
    print(f"Done. Chart saved to: {output_path}")


if __name__ == "__main__":
    main()
