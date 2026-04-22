import type {
  User,
  Instrument,
  EventBand,
  EventBandMember,
  LiveEvent,
  MemberSnapshot,
  Milestone,
  Task,
  Setlist,
  SetlistSong,
  Expense,
  BandSchedule,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Prisma include presets (reuse in route files)
// ---------------------------------------------------------------------------

export const userInclude = {
  instruments: { include: { instrument: true } },
} as const;

export const eventBandInclude = {
  members: { include: { user: { include: userInclude } } },
  snapshots: true,
  setlist: { include: { songs: true } },
} as const;

export const liveEventInclude = {
  bands: { include: eventBandInclude },
  milestones: { include: { tasks: true } },
} as const;

// ---------------------------------------------------------------------------
// Local Prisma payload shapes (avoids importing full Prisma namespace)
// ---------------------------------------------------------------------------

type PrismaInstrument = {
  id: string;
  name: string;
  order: number;
};

type PrismaUserInstrument = {
  instrument: PrismaInstrument;
};

type PrismaUser = {
  id: string;
  sub: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: Date;
  instruments?: PrismaUserInstrument[];
};

type PrismaEventBandMember = {
  eventBandId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: PrismaUser;
};

type PrismaTask = {
  id: string;
  milestoneId: string;
  eventBandId: string | null;
  title: string;
  assigneeUserId: string | null;
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
  eventBandId: string;
  updatedAt: Date;
  songs: PrismaSetlistSong[];
};

type PrismaMemberSnapshot = {
  userId: string;
  nickname: string;
  role: string;
  takenAt: Date;
};

type PrismaEventBand = {
  id: string;
  liveEventId: string;
  name: string;
  description: string | null;
  members: PrismaEventBandMember[];
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
  bands: PrismaEventBand[];
  milestones: PrismaMilestone[];
};

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

export function serializeInstrument(i: PrismaInstrument): Instrument {
  return { id: i.id, name: i.name, order: i.order };
}

export function serializeUser(u: PrismaUser): User {
  return {
    id: u.id,
    sub: u.sub,
    nickname: u.nickname,
    avatarUrl: u.avatarUrl ?? undefined,
    instruments: (u.instruments ?? [])
      .map((ui) => serializeInstrument(ui.instrument))
      .sort((a, b) => a.order - b.order),
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeEventBandMember(m: PrismaEventBandMember): EventBandMember {
  return {
    userId: m.userId,
    user: serializeUser(m.user),
    role: m.role as EventBandMember["role"],
    joinedAt: m.joinedAt.toISOString(),
  };
}

export function serializeTask(t: PrismaTask): Task {
  return {
    id: t.id,
    milestoneId: t.milestoneId,
    eventBandId: t.eventBandId ?? undefined,
    title: t.title,
    assigneeUserId: t.assigneeUserId ?? undefined,
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
    eventBandId: s.eventBandId,
    songs: s.songs.map(serializeSetlistSong),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function serializeMemberSnapshot(s: PrismaMemberSnapshot): MemberSnapshot {
  return {
    userId: s.userId,
    nickname: s.nickname,
    role: s.role as MemberSnapshot["role"],
  };
}

export function serializeEventBand(b: PrismaEventBand): EventBand {
  const snapshotTakenAt = b.snapshots.length > 0
    ? b.snapshots.reduce((earliest, s) =>
        s.takenAt < earliest ? s.takenAt : earliest,
        b.snapshots[0].takenAt
      ).toISOString()
    : undefined;

  return {
    id: b.id,
    liveEventId: b.liveEventId,
    name: b.name,
    description: b.description ?? undefined,
    members: b.members.map(serializeEventBandMember),
    memberSnapshot: b.snapshots.map(serializeMemberSnapshot),
    setlist: serializeSetlist(b.setlist!),
    snapshotTakenAt,
  };
}

type PrismaExpense = {
  id: string;
  liveEventId: string;
  paidBy: string;
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  paidByUser: PrismaUser;
};

export function serializeExpense(e: PrismaExpense): Expense {
  return {
    id: e.id,
    liveEventId: e.liveEventId,
    paidBy: e.paidBy,
    paidByName: e.paidByUser.nickname,
    amount: e.amount,
    category: e.category,
    description: e.description,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

type PrismaBandSchedule = {
  id: string;
  eventBandId: string;
  location: string;
  startAt: Date;
  endAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  eventBand: { name: string };
};

export function serializeBandSchedule(s: PrismaBandSchedule): BandSchedule {
  return {
    id: s.id,
    eventBandId: s.eventBandId,
    bandName: s.eventBand.name,
    location: s.location,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    createdBy: s.createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
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
    bands: e.bands.map(serializeEventBand),
    milestones: e.milestones
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        ...serializeMilestone(m),
        tasks: m.tasks.sort((a, b) => a.order - b.order).map(serializeTask),
      })),
  };
}
