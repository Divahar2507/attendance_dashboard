--
-- PostgreSQL database dump
--

\restrict 6mAQXYZWBLiOhSuyavcTN3PJoFYZAPerFf2yLnmNb3q7fetQL2PMHRr6oUadPE7

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-26 17:29:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 860 (class 1247 OID 68172)
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED'
);


ALTER TYPE public.ticket_status OWNER TO postgres;

--
-- TOC entry 857 (class 1247 OID 68159)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'TEAM_LEAD',
    'DEVELOPER',
    'DESIGNER',
    'DM',
    'USER'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 68219)
-- Name: ticket_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_updates (
    id integer NOT NULL,
    ticket_id integer,
    update_text text NOT NULL,
    screenshot_path character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_updates OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 68218)
-- Name: ticket_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_updates_id_seq OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 223
-- Name: ticket_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_updates_id_seq OWNED BY public.ticket_updates.id;


--
-- TOC entry 222 (class 1259 OID 68199)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    month character varying(20) NOT NULL,
    year integer NOT NULL,
    user_id integer,
    status public.ticket_status DEFAULT 'OPEN'::public.ticket_status,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 68198)
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO postgres;

--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 221
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- TOC entry 220 (class 1259 OID 68182)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'USER'::public.user_role,
    department character varying(100),
    refresh_token text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 68181)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4878 (class 2604 OID 68222)
-- Name: ticket_updates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_updates ALTER COLUMN id SET DEFAULT nextval('public.ticket_updates_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 68202)
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 68185)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5042 (class 0 OID 68219)
-- Dependencies: 224
-- Data for Name: ticket_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5040 (class 0 OID 68199)
-- Dependencies: 222
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5038 (class 0 OID 68182)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'Super Admin', 'admin@infinite.com', '$2b$10$suxS2oLxZBtZGbyaN9/Zuufm5w3UNi9h.GTsgsr6ffH5x09SjvjQ2', 'ADMIN', NULL, NULL, '2026-01-26 16:56:48.81266+05:30');


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 223
-- Name: ticket_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_updates_id_seq', 1, false);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 221
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 1, false);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4887 (class 2606 OID 68229)
-- Name: ticket_updates ticket_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_updates
    ADD CONSTRAINT ticket_updates_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 68212)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 68197)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4883 (class 2606 OID 68195)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4889 (class 2606 OID 68230)
-- Name: ticket_updates ticket_updates_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_updates
    ADD CONSTRAINT ticket_updates_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 4888 (class 2606 OID 68213)
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-26 17:29:27

--
-- PostgreSQL database dump complete
--

\unrestrict 6mAQXYZWBLiOhSuyavcTN3PJoFYZAPerFf2yLnmNb3q7fetQL2PMHRr6oUadPE7

