import type {
  User,
  Band,
  BandMember,
  LiveEvent,
  LiveEventBand,
  MemberSnapshot,
  Milestone,
  Task,
  Setlist,
  SetlistSong,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Prisma include presets (reuse in route files)
// ---------------------------------------------------------------------------

export const bandInclude = {
  members: { include: { user: true } },
} as const;

export const liveEventBandInclude = {
  band: { include: { members: { include: { user: true } } } },
  snapshots: true,
  setlist: { include: { songs: true } },
} as const;

export const liveEventInclude = {
  bands: { include: liveEventBandInclude },
  milestones: { include: { tasks: true } },
} as const;

// ---------------------------------------------------------------------------
// Local Prisma payload shapes (avoids importing full Prisma namespace)
// ---------------------------------------------------------------------------

type PrismaUser = {
  sub: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type PrismaBandMember = {
  bandId: string;
  userSub: string;
  role: string;
  joinedAt: Date;
  user: PrismaUser;
};

type PrismaBand = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: PrismaBandMember[];
};

type PrismaTask = {
  id: string;
  milestoneId: string;
  liveEventBandId: string | null;
  title: string;
  assigneeUserSub: string | null;
  status: string;
  order: number;
};

type PrismaMilestone = {
  id: string;
  liveEventId: string;
  title: string;
  dueDate: Date | null;
  status: string;
  order: number;
  tasks: PrismaTask[];
};

type PrismaSetlistSong = {
  order: number;
  title: string;
  duration: number | null;
  note: string | null;
};

type PrismaSetlist = {
  id: string;
  liveEventBandId: string;
  updatedAt: Date;
  songs: PrismaSetlistSong[];
};

type PrismaMemberSnapshot = {
  userSub: string;
  nickname: string;
  role: string;
};

type PrismaLiveEventBand = {
  id: string;
  liveEventId: string;
  bandId: string;
  snapshotTakenAt: Date | null;
  band: PrismaBand;
  snapshots: PrismaMemberSnapshot[];
  setlist: PrismaSetlist | null;
};

type PrismaLiveEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  venue: string | null;
  photoAlbumUrl: string | null;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  bands: PrismaLiveEventBand[];
  milestones: PrismaMilestone[];
};

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

export function serializeUser(u: PrismaUser): User {
  return {
    sub: u.sub,
    nickname: u.nickname,
    avatarUrl: u.avatarUrl ?? undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeBandMember(m: PrismaBandMember): BandMember {
  return {
    userSub: m.userSub,
    user: serializeUser(m.user),
    role: m.role as BandMember["role"],
    joinedAt: m.joinedAt.toISOString(),
  };
}

export function serializeBand(b: PrismaBand): Band {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    members: b.members.map(serializeBandMember),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export function serializeTask(t: PrismaTask): Task {
  return {
    id: t.id,
    milestoneId: t.milestoneId,
    liveEventBandId: t.liveEventBandId ?? undefined,
    title: t.title,
    assigneeUserSub: t.assigneeUserSub ?? undefined,
    status: t.status as Task["status"],
    order: t.order,
  };
}

export function serializeMilestone(m: PrismaMilestone): Milestone {
  return {
    id: m.id,
    liveEventId: m.liveEventId,
    title: m.title,
    dueDate: m.dueDate?.toISOString() ?? undefined,
    status: m.status as Milestone["status"],
    order: m.order,
    tasks: m.tasks.map(serializeTask),
  };
}

export function serializeSetlistSong(s: PrismaSetlistSong): SetlistSong {
  return {
    order: s.order,
    title: s.title,
    duration: s.duration ?? undefined,
    note: s.note ?? undefined,
  };
}

export function serializeSetlist(s: PrismaSetlist): Setlist {
  return {
    id: s.id,
    liveEventBandId: s.liveEventBandId,
    songs: s.songs.map(serializeSetlistSong),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function serializeMemberSnapshot(s: PrismaMemberSnapshot): MemberSnapshot {
  return {
    userSub: s.userSub,
    nickname: s.nickname,
    role: s.role as MemberSnapshot["role"],
  };
}

export function serializeLiveEventBand(b: PrismaLiveEventBand): LiveEventBand {
  return {
    id: b.id,
    liveEventId: b.liveEventId,
    bandId: b.bandId,
    band: serializeBand(b.band),
    memberSnapshot: b.snapshots.map(serializeMemberSnapshot),
    // setlist is always created together with LiveEventBand
    setlist: serializeSetlist(b.setlist!),
    snapshotTakenAt: b.snapshotTakenAt?.toISOString() ?? undefined,
  };
}

export function serializeLiveEvent(e: PrismaLiveEvent): LiveEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    date: e.date?.toISOString() ?? undefined,
    venue: e.venue ?? undefined,
    photoAlbumUrl: e.photoAlbumUrl ?? undefined,
    status: e.status as LiveEvent["status"],
    createdBy: e.createdBy,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    bands: e.bands.map(serializeLiveEventBand),
    milestones: e.milestones
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        ...serializeMilestone(m),
        tasks: m.tasks.sort((a, b) => a.order - b.order).map(serializeTask),
      })),
  };
}
