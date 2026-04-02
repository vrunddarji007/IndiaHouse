const formatDate = require('./formatDate');

/**
 * Reusable suspension checker.
 * Returns { isSuspended: boolean, response: object|null }
 * If isSuspended is true, `response` contains the JSON payload + statusCode to send.
 */
const checkSuspension = (user) => {
  if (!user) {
    return { isSuspended: false, response: null };
  }

  const now = new Date();
  const isSuspended =
    user.status === 'banned' ||
    (user.suspendedUntil && now < new Date(user.suspendedUntil));

  if (!isSuspended) {
    return { isSuspended: false, response: null };
  }

  // Calculate duration label if missing
  let durationLabel = user.suspensionDurationLabel;
  if (!durationLabel && user.suspendedUntil) {
    const diffHours = Math.round(
      (new Date(user.suspendedUntil).getTime() - Date.now()) / 3600000
    );
    if (diffHours <= 24) durationLabel = '24 Hour';
    else if (diffHours <= 24 * 7) durationLabel = '1 Week';
    else if (diffHours <= 24 * 30) durationLabel = '1 Month';
    else durationLabel = '1 Year';
  }

  const durationMsg = durationLabel ? ` for ${durationLabel} ` : ' ';
  const formattedDate = user.suspendedUntil
    ? formatDate(user.suspendedUntil)
    : '';

  const message =
    user.status === 'banned'
      ? 'Your account is permanently banned'
      : `Your account is suspended${durationMsg}until ${formattedDate}`;

  return {
    isSuspended: true,
    response: {
      statusCode: 403,
      body: {
        success: false,
        message,
        isSuspended: true,
        suspendedUntil: user.suspendedUntil,
        suspensionDurationLabel: durationLabel,
        status: user.status,
      },
    },
  };
};

module.exports = checkSuspension;
