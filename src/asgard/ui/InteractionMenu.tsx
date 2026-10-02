// The menu for an agent or a house: name, role, current task and what they're doing right now.
// Placeholder styling (see .asgard-menu in asgard.css). Closes with Escape, E or the button.

import { useEffect, useRef, useState } from 'react';
import type { Target } from '../types';

type Props = {
	target: Target;
	statusOf: (agentId: string) => string; // live, from the game: "Walking to …", "Report at …"
	onClose: () => void;
};

export function InteractionMenu({ target, statusOf, onClose }: Props) {
	const close = useRef<HTMLButtonElement>(null);
	const agent = target.kind === 'agent' ? target.agent : target.agent;
	const [status, setStatus] = useState(() => (agent ? statusOf(agent.id) : ''));

	// Keep the status current while the menu is open
	useEffect(() => {
		if (!agent) return;
		const timer = setInterval(() => setStatus(statusOf(agent.id)), 500);
		return () => clearInterval(timer);
	}, [agent, statusOf]);

	useEffect(() => {
		close.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
				e.preventDefault();
				onClose();
			}
		};
		addEventListener('keydown', onKey);
		return () => removeEventListener('keydown', onKey);
	}, [onClose]);

	return (
		<div className="asgard-menu" role="dialog" aria-labelledby="asgard-menu-title">
			{target.kind === 'building' && (
				<>
					<p className="asgard-kicker">House</p>
					<h2 id="asgard-menu-title">{target.building.name}</h2>
					{target.building.description && <p>{target.building.description}</p>}
				</>
			)}

			{target.kind === 'agent' && (
				<>
					<p className="asgard-kicker">Agent</p>
					<h2 id="asgard-menu-title">{target.agent.name}</h2>
				</>
			)}

			{agent ? (
				<dl>
					{target.kind === 'building' && (
						<div>
							<dt>Lives here</dt>
							<dd>{agent.name}</dd>
						</div>
					)}
					<div>
						<dt>Role</dt>
						<dd>{agent.role}</dd>
					</div>
					<div>
						<dt>Current task</dt>
						<dd>{agent.task}</dd>
					</div>
					{status && (
						<div>
							<dt>Right now</dt>
							<dd>{status}</dd>
						</div>
					)}
				</dl>
			) : (
				<p className="asgard-muted">Nobody lives here yet.</p>
			)}

			<button type="button" className="asgard-button small" ref={close} onClick={onClose}>
				Close <kbd>Esc</kbd>
			</button>
		</div>
	);
}
