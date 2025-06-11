--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: family_photos
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO family_photos;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: family_photos
--

COMMENT ON SCHEMA public IS '';


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: family_photos
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MEMBER',
    'GUEST'
);


ALTER TYPE public."UserRole" OWNER TO family_photos;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _AlbumToPhoto; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public."_AlbumToPhoto" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_AlbumToPhoto" OWNER TO family_photos;

--
-- Name: _PhotoToTag; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public."_PhotoToTag" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_PhotoToTag" OWNER TO family_photos;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO family_photos;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO family_photos;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.albums (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.albums OWNER TO family_photos;

--
-- Name: albums_id_seq; Type: SEQUENCE; Schema: public; Owner: family_photos
--

CREATE SEQUENCE public.albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.albums_id_seq OWNER TO family_photos;

--
-- Name: albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_photos
--

ALTER SEQUENCE public.albums_id_seq OWNED BY public.albums.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "userId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO family_photos;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: family_photos
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO family_photos;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_photos
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: photos; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    url text NOT NULL,
    title character varying(70),
    notes character varying(1000),
    date timestamp(3) without time zone,
    "isFamilyOnly" boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.photos OWNER TO family_photos;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: family_photos
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.photos_id_seq OWNER TO family_photos;

--
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_photos
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" integer NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO family_photos;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tags OWNER TO family_photos;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: family_photos
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO family_photos;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_photos
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    role public."UserRole" NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "lastFailedLogin" timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO family_photos;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: family_photos
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO family_photos;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_photos
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: family_photos
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO family_photos;

--
-- Name: albums id; Type: DEFAULT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.albums ALTER COLUMN id SET DEFAULT nextval('public.albums_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _AlbumToPhoto; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public."_AlbumToPhoto" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _PhotoToTag; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public."_PhotoToTag" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
42d51562-b52f-4d5e-9ed5-ed1b1a66deda	e873ba630a1a37593d717142c0790071ef964b1cad3602aab07358edbfcfc7d3	2025-06-06 17:02:24.064338+00	20250606170223_add_auth_tables	\N	\N	2025-06-06 17:02:24.033546+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.albums (id, name, created_at, updated_at) FROM stdin;
1	All Photos	2025-06-11 14:16:33.584	2025-06-11 14:16:33.584
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.notifications (id, message, "isRead", "userId", created_at, updated_at) FROM stdin;
1	New registration request from LucyTest (lucy.toman@gmail.com)	f	1	2025-06-10 10:25:56.657	2025-06-10 10:25:56.657
2	New registration request from TestReg (lucy.toman+testreg@gmail.com)	f	1	2025-06-10 10:58:01.469	2025-06-10 10:58:01.469
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.photos (id, url, title, notes, date, "isFamilyOnly", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.tags (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.users (id, username, email, "passwordHash", role, "emailVerified", "failedLoginAttempts", "lastFailedLogin", created_at, updated_at) FROM stdin;
5	TestReg	lucy.toman+testreg@gmail.com	$2b$10$hRjWeo4TQYz8NYBYyTYFp.A/UTWorqif3FzYltqf0is0I5jOVQs.W	GUEST	t	0	\N	2025-06-10 10:58:01.463	2025-06-10 10:58:44.492
6	Guest	guest@family-photos.app		GUEST	t	0	\N	2025-06-10 11:26:04.974	2025-06-10 11:26:04.974
4	LucyTest	lucy.toman@gmail.com	$2b$10$hsLgQvIHKUzGuDEgiv2csulEycx8oA9FZcrG9kMcTIvszq3H7IP7e	GUEST	t	0	\N	2025-06-10 10:25:55.584	2025-06-11 09:48:21.309
1	Lucy	lucy@toman.me.uk	$2b$10$Pg9KzLI2P0jXMoVRWTpU3u5usXcm10v4ES7P8SlQ76JEq/o8czYwm	ADMIN	t	0	\N	2025-06-06 17:02:28.91	2025-06-11 09:52:20.248
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: family_photos
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: family_photos
--

SELECT pg_catalog.setval('public.albums_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: family_photos
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: family_photos
--

SELECT pg_catalog.setval('public.photos_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: family_photos
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: family_photos
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: _AlbumToPhoto _AlbumToPhoto_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_AlbumToPhoto"
    ADD CONSTRAINT "_AlbumToPhoto_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PhotoToTag _PhotoToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_PhotoToTag"
    ADD CONSTRAINT "_PhotoToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _AlbumToPhoto_B_index; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE INDEX "_AlbumToPhoto_B_index" ON public."_AlbumToPhoto" USING btree ("B");


--
-- Name: _PhotoToTag_B_index; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE INDEX "_PhotoToTag_B_index" ON public."_PhotoToTag" USING btree ("B");


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: albums_name_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX albums_name_key ON public.albums USING btree (name);


--
-- Name: photos_url_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX photos_url_key ON public.photos USING btree (url);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: family_photos
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: _AlbumToPhoto _AlbumToPhoto_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_AlbumToPhoto"
    ADD CONSTRAINT "_AlbumToPhoto_A_fkey" FOREIGN KEY ("A") REFERENCES public.albums(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _AlbumToPhoto _AlbumToPhoto_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_AlbumToPhoto"
    ADD CONSTRAINT "_AlbumToPhoto_B_fkey" FOREIGN KEY ("B") REFERENCES public.photos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PhotoToTag _PhotoToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_PhotoToTag"
    ADD CONSTRAINT "_PhotoToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public.photos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PhotoToTag _PhotoToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public."_PhotoToTag"
    ADD CONSTRAINT "_PhotoToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_photos
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: family_photos
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

