import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMock = vi.fn();
const getUserMock = vi.fn();
const updateUserMetadataMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
  clerkClient: async () => ({
    users: {
      getUser: getUserMock,
      updateUserMetadata: updateUserMetadataMock,
    },
  }),
}));

import { GET } from './route';

beforeEach(() => {
  authMock.mockReset();
  getUserMock.mockReset();
  updateUserMetadataMock.mockReset();
});

describe('GET /api/admin/upgrade-self', () => {
  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue({ userId: null });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('returns 403 for a signed-in user who is not an admin', async () => {
    authMock.mockResolvedValue({ userId: 'user_123' });
    getUserMock.mockResolvedValue({ emailAddresses: [{ emailAddress: 'not-an-admin@example.com' }] });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: 'Forbidden' });
    expect(updateUserMetadataMock).not.toHaveBeenCalled();
  });

  it('upgrades an admin user to the full plan', async () => {
    authMock.mockResolvedValue({ userId: 'user_admin' });
    getUserMock.mockResolvedValue({ emailAddresses: [{ emailAddress: 'ritesh@gratiantechnologies.com' }] });
    updateUserMetadataMock.mockResolvedValue(undefined);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      userId: 'user_admin',
      email: 'ritesh@gratiantechnologies.com',
      plan: 'full',
    });
    expect(updateUserMetadataMock).toHaveBeenCalledWith('user_admin', {
      publicMetadata: { plan: 'full' },
    });
  });

  it('treats a missing email address as non-admin (403), not a crash', async () => {
    authMock.mockResolvedValue({ userId: 'user_no_email' });
    getUserMock.mockResolvedValue({ emailAddresses: [] });

    const res = await GET();

    expect(res.status).toBe(403);
    expect(updateUserMetadataMock).not.toHaveBeenCalled();
  });
});
