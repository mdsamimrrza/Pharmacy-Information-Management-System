const ADMIN_ACCESS_KEY = 'pims_admin_login_access';
const ADMIN_ACCESS_WINDOW_MS = 10 * 60 * 1000;
const ADMIN_ACCESS_ATTEMPTS_KEY = 'pims_admin_login_attempts';
const ADMIN_ACCESS_MAX_ATTEMPTS = 5;
const ADMIN_ACCESS_LOCKOUT_MS = 5 * 60 * 1000;

function parseAccessPayload(value) {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(value);
    return typeof payload?.expiresAt === 'number' ? payload : null;
  } catch (_error) {
    return null;
  }
}

function parseAttemptPayload(value) {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(value);
    return typeof payload?.attempts === 'number' ? payload : null;
  } catch (_error) {
    return null;
  }
}

function getAttemptState() {
  const payload = parseAttemptPayload(sessionStorage.getItem(ADMIN_ACCESS_ATTEMPTS_KEY));

  if (!payload) {
    return {
      attempts: 0,
      lockUntil: 0
    };
  }

  if (payload.lockUntil && payload.lockUntil <= Date.now()) {
    sessionStorage.removeItem(ADMIN_ACCESS_ATTEMPTS_KEY);
    return {
      attempts: 0,
      lockUntil: 0
    };
  }

  return {
    attempts: Math.max(0, Number(payload.attempts) || 0),
    lockUntil: Math.max(0, Number(payload.lockUntil) || 0)
  };
}

function setAttemptState(state) {
  sessionStorage.setItem(ADMIN_ACCESS_ATTEMPTS_KEY, JSON.stringify(state));
}

export function grantAdminLoginAccess() {
  const payload = {
    expiresAt: Date.now() + ADMIN_ACCESS_WINDOW_MS
  };

  sessionStorage.setItem(ADMIN_ACCESS_KEY, JSON.stringify(payload));
  sessionStorage.removeItem(ADMIN_ACCESS_ATTEMPTS_KEY);
}

export function hasAdminLoginAccess() {
  const payload = parseAccessPayload(sessionStorage.getItem(ADMIN_ACCESS_KEY));

  if (!payload || payload.expiresAt <= Date.now()) {
    sessionStorage.removeItem(ADMIN_ACCESS_KEY);
    return false;
  }

  return true;
}

export function clearAdminLoginAccess() {
  sessionStorage.removeItem(ADMIN_ACCESS_KEY);
}

export function getAdminAccessLockState() {
  const state = getAttemptState();
  const now = Date.now();

  return {
    isLocked: state.lockUntil > now,
    lockUntil: state.lockUntil,
    attemptsRemaining: Math.max(0, ADMIN_ACCESS_MAX_ATTEMPTS - state.attempts)
  };
}

export function registerFailedAdminAccessAttempt() {
  const currentState = getAttemptState();
  const nextAttempts = currentState.attempts + 1;

  if (nextAttempts >= ADMIN_ACCESS_MAX_ATTEMPTS) {
    const lockUntil = Date.now() + ADMIN_ACCESS_LOCKOUT_MS;
    setAttemptState({ attempts: nextAttempts, lockUntil });
    return {
      isLocked: true,
      lockUntil,
      attemptsRemaining: 0
    };
  }

  setAttemptState({ attempts: nextAttempts, lockUntil: 0 });
  return {
    isLocked: false,
    lockUntil: 0,
    attemptsRemaining: ADMIN_ACCESS_MAX_ATTEMPTS - nextAttempts
  };
}
