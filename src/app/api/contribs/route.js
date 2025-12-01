import React from 'react';
  
  const Route = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Route;
  // app/api/contribs/route.js
import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

/**
 * Flatten weeks -> contributionDays and normalize shape:
 * returns array of { date, contributionCount, color }
 */
function flattenWeeks(weeks = []) {
  return weeks.flatMap(w => (w.contributionDays || []).map(d => ({
    date: d.date,
    contributionCount: d.contributionCount,
    color: d.color || null,
  })));
}

/**
 * Build ISO date strings for "from" and "to"
 * Default: last 365 days (to = today, from = today - 365d)
 */
function defaultRange() {
  const to = new Date();
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get('username') || '').trim();
    if (!username) {
      return NextResponse.json({ error: 'username query param required' }, { status: 400 });
    }

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const { from, to } = fromParam && toParam ? { from: fromParam, to: toParam } : defaultRange();

    const query = `
      query Contributions($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
    }

    const resp = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username, from, to },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'GitHub API error', status: resp.status, details: text }, { status: 502 });
    }

    const json = await resp.json();
    if (json.errors) {
      return NextResponse.json({ error: 'GitHub GraphQL errors', details: json.errors }, { status: 502 });
    }

    const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
    const total = json?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;
    const days = flattenWeeks(weeks);

    // Return days sorted ascending by date
    days.sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json(
      { total, days },
      {
        status: 200,
        headers: {
          // Cache for 1 hour on CDN (s-maxage) and no browser caching (max-age=0)
          'Cache-Control': 'public, max-age=0, s-maxage=3600',
        },
      }
    );
  } catch (err) {
    console.error('Error in /api/contribs:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
