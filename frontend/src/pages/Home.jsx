import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <nav className="topnav">
        <span className="brand">SmartResolve</span>
        <ul className="nav-links">
          <li><Link to="/login">Log in</Link></li>
          <li><Link to="/signup" className="cta">Sign up</Link></li>
        </ul>
      </nav>

      {/* Full-width statement hero, no side card */}
      <section className="hero2">
        <h1>Every complaint, seen by the right person — automatically.</h1>
        <p className="lede2">
          SmartResolve routes issues to an available agent the moment they're filed,
          keeps the conversation live until it's closed, and gives admins a clear
          view of anything that slips through.
        </p>
        <div className="hero2-actions">
          <Link to="/signup" className="btn-primary">Get started</Link>
          <a href="#how-it-works" className="btn-secondary">See how it works</a>
        </div>
      </section>

      {/* Alternating feature rows, each with its own mock preview */}
      <section id="how-it-works" className="feature-rows">
        <div className="feature-row">
          <div className="feature-copy">
            <span className="feature-kicker">Routing</span>
            <h2>Assigned before an admin even sees it</h2>
            <p>
              Every new complaint checks who's actually available in the right
              department and hands it to whoever has the lightest load. If nobody's
              free, it waits in a manual queue instead of sitting on someone's desk
              who isn't there.
            </p>
          </div>
          <div className="feature-visual">
            <div className="mock-card">
              <div className="mock-row"><span>Category</span><strong>Technical</strong></div>
              <div className="mock-row"><span>Checking availability</span><strong>2 agents free</strong></div>
              <div className="mock-row highlight"><span>Assigned to</span><strong>Rahul K. — 1 open case</strong></div>
            </div>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-copy">
            <span className="feature-kicker">Conversation</span>
            <h2>Talk it out, without leaving the page</h2>
            <p>
              Once assigned, the user and agent share a live chat tied to that one
              complaint — no phone tag, no separate email thread, and no need to
              refresh to see a reply.
            </p>
          </div>
          <div className="feature-visual">
            <div className="mock-card mock-chat">
              <div className="chat-bubble theirs"><span className="sender">Priya</span>My data stopped working today.</div>
              <div className="chat-bubble mine"><span className="sender">Rahul</span>Can you restart your router first?</div>
            </div>
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-copy">
            <span className="feature-kicker">Oversight</span>
            <h2>Three roles, one clear picture</h2>
            <p>
              Users track their own complaints. Agents see only what's assigned to
              them. Admins see everything — and step in only for the cases the
              system couldn't place on its own.
            </p>
          </div>
          <div className="feature-visual">
            <div className="mock-card mock-roles">
              <div className="role-pill">User — 3 open</div>
              <div className="role-pill">Agent — Technical dept.</div>
              <div className="role-pill">Admin — 1 needs assignment</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to try it?</h2>
        <p>Create an account and file your first complaint in under a minute.</p>
        <Link to="/signup" className="btn-primary">Sign up free</Link>
      </section>
    </div>
  );
}
