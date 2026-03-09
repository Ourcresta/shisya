--
-- PostgreSQL database dump
--

\restrict DwZCAMbWYkFcRrOCOl0BhylTPp3VdQ24Hw4shYU3JfF6iNeZVnhFdvW1tWBjULB

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    short_description character varying(500),
    level character varying(20) DEFAULT 'beginner'::character varying NOT NULL,
    duration character varying(50),
    skills text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    is_free boolean DEFAULT false NOT NULL,
    credit_cost integer DEFAULT 0 NOT NULL,
    test_required boolean DEFAULT false NOT NULL,
    project_required boolean DEFAULT false NOT NULL,
    thumbnail_url text,
    instructor_id character varying(36),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    language character varying(20) DEFAULT 'en'::character varying NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    published_at timestamp without time zone,
    zoho_id character varying(100),
    category character varying(100),
    group_title character varying(255),
    trainer_central_course_url text,
    rating real,
    total_students integer DEFAULT 0
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: guru_admin_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guru_admin_sessions (
    id character varying(36) NOT NULL,
    admin_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.guru_admin_sessions OWNER TO postgres;

--
-- Name: guru_admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guru_admin_users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.guru_admin_users OWNER TO postgres;

--
-- Name: guru_admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guru_admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guru_admin_users_id_seq OWNER TO postgres;

--
-- Name: guru_admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guru_admin_users_id_seq OWNED BY public.guru_admin_users.id;


--
-- Name: labs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labs (
    id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer,
    title character varying(255) NOT NULL,
    instructions text NOT NULL,
    starter_code text,
    expected_output text,
    solution_code text,
    language character varying(20) DEFAULT 'javascript'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.labs OWNER TO postgres;

--
-- Name: labs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.labs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.labs_id_seq OWNER TO postgres;

--
-- Name: labs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.labs_id_seq OWNED BY public.labs.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    module_id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    video_url text,
    duration_minutes integer,
    order_index integer DEFAULT 0 NOT NULL,
    is_preview boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    trainer_central_url text
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_plans (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    subtitle character varying(100),
    price character varying(50) NOT NULL,
    period character varying(50),
    coins character varying(50),
    coins_label character varying(50),
    icon_name character varying(50) DEFAULT 'Gift'::character varying NOT NULL,
    features text DEFAULT '[]'::text NOT NULL,
    not_included text DEFAULT '[]'::text NOT NULL,
    cta character varying(100) DEFAULT 'Get Started'::character varying NOT NULL,
    href character varying(255) DEFAULT '/signup'::character varying NOT NULL,
    button_variant character varying(20) DEFAULT 'outline'::character varying NOT NULL,
    popular boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pricing_plans OWNER TO postgres;

--
-- Name: pricing_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pricing_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_plans_id_seq OWNER TO postgres;

--
-- Name: pricing_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pricing_plans_id_seq OWNED BY public.pricing_plans.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    difficulty character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    requirements text,
    resources text,
    estimated_hours integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: shishya_ai_nudge_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_ai_nudge_logs (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer,
    nudge_type character varying(30) NOT NULL,
    message text NOT NULL,
    channel character varying(20) DEFAULT 'app'::character varying NOT NULL,
    rule_id integer,
    is_read boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_ai_nudge_logs OWNER TO postgres;

--
-- Name: shishya_ai_nudge_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_ai_nudge_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_ai_nudge_logs_id_seq OWNER TO postgres;

--
-- Name: shishya_ai_nudge_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_ai_nudge_logs_id_seq OWNED BY public.shishya_ai_nudge_logs.id;


--
-- Name: shishya_course_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_course_enrollments (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer NOT NULL,
    credits_paid integer DEFAULT 0 NOT NULL,
    enrolled_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_course_enrollments OWNER TO postgres;

--
-- Name: TABLE shishya_course_enrollments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_course_enrollments IS 'SHISHYA student portal - course enrollments';


--
-- Name: shishya_course_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_course_enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_course_enrollments_id_seq OWNER TO postgres;

--
-- Name: shishya_course_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_course_enrollments_id_seq OWNED BY public.shishya_course_enrollments.id;


--
-- Name: shishya_credit_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_credit_transactions (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    amount integer NOT NULL,
    type character varying(20) NOT NULL,
    reason character varying(50) NOT NULL,
    description text,
    reference_id integer,
    balance_after integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_credit_transactions OWNER TO postgres;

--
-- Name: shishya_credit_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_credit_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_credit_transactions_id_seq OWNER TO postgres;

--
-- Name: shishya_credit_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_credit_transactions_id_seq OWNED BY public.shishya_credit_transactions.id;


--
-- Name: shishya_gift_boxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_gift_boxes (
    id integer NOT NULL,
    sender_id character varying(36) NOT NULL,
    recipient_email character varying(255) NOT NULL,
    points integer NOT NULL,
    payment_id character varying(100),
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    claimed_by character varying(36),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    claimed_at timestamp without time zone
);


ALTER TABLE public.shishya_gift_boxes OWNER TO postgres;

--
-- Name: shishya_gift_boxes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_gift_boxes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_gift_boxes_id_seq OWNER TO postgres;

--
-- Name: shishya_gift_boxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_gift_boxes_id_seq OWNED BY public.shishya_gift_boxes.id;


--
-- Name: shishya_marksheet_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_marksheet_verifications (
    id integer NOT NULL,
    marksheet_id integer NOT NULL,
    verifier_ip character varying(45),
    verifier_user_agent text,
    verified_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_marksheet_verifications OWNER TO postgres;

--
-- Name: shishya_marksheet_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_marksheet_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_marksheet_verifications_id_seq OWNER TO postgres;

--
-- Name: shishya_marksheet_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_marksheet_verifications_id_seq OWNED BY public.shishya_marksheet_verifications.id;


--
-- Name: shishya_marksheets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_marksheets (
    id integer NOT NULL,
    marksheet_id character varying(30) NOT NULL,
    user_id character varying(36) NOT NULL,
    student_name text NOT NULL,
    student_email character varying(255) NOT NULL,
    program_name text DEFAULT 'Full Stack Development'::text NOT NULL,
    academic_year character varying(10) NOT NULL,
    course_data text NOT NULL,
    total_marks integer DEFAULT 0 NOT NULL,
    obtained_marks integer DEFAULT 0 NOT NULL,
    percentage integer DEFAULT 0 NOT NULL,
    grade character varying(5) NOT NULL,
    cgpa character varying(5) NOT NULL,
    result character varying(20) NOT NULL,
    classification character varying(30) NOT NULL,
    total_credits integer DEFAULT 0 NOT NULL,
    courses_completed integer DEFAULT 0 NOT NULL,
    reward_coins integer DEFAULT 0 NOT NULL,
    scholarship_eligible boolean DEFAULT false NOT NULL,
    verification_code character varying(20) NOT NULL,
    pdf_hash text,
    signed_by text DEFAULT 'Controller of Examinations'::text,
    ai_verifier_name text DEFAULT 'Acharya Usha'::text,
    issued_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL
);


ALTER TABLE public.shishya_marksheets OWNER TO postgres;

--
-- Name: shishya_marksheets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_marksheets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_marksheets_id_seq OWNER TO postgres;

--
-- Name: shishya_marksheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_marksheets_id_seq OWNED BY public.shishya_marksheets.id;


--
-- Name: shishya_motivation_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_motivation_cards (
    id integer NOT NULL,
    card_id character varying(20) NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer,
    course_title text,
    card_type character varying(30) NOT NULL,
    title text NOT NULL,
    subtitle text,
    badge character varying(50),
    stats text,
    message text,
    percentile_rank integer,
    is_shareable boolean DEFAULT true NOT NULL,
    share_url text,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_motivation_cards OWNER TO postgres;

--
-- Name: shishya_motivation_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_motivation_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_motivation_cards_id_seq OWNER TO postgres;

--
-- Name: shishya_motivation_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_motivation_cards_id_seq OWNED BY public.shishya_motivation_cards.id;


--
-- Name: shishya_motivation_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_motivation_rules (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    rule_type character varying(30) NOT NULL,
    conditions text NOT NULL,
    actions text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    cooldown_hours integer DEFAULT 24 NOT NULL,
    max_trigger_count integer,
    is_active boolean DEFAULT true NOT NULL,
    is_global boolean DEFAULT true NOT NULL,
    course_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_motivation_rules OWNER TO postgres;

--
-- Name: shishya_motivation_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_motivation_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_motivation_rules_id_seq OWNER TO postgres;

--
-- Name: shishya_motivation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_motivation_rules_id_seq OWNED BY public.shishya_motivation_rules.id;


--
-- Name: shishya_mystery_boxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_mystery_boxes (
    id integer NOT NULL,
    box_id character varying(20) NOT NULL,
    user_id character varying(36) NOT NULL,
    rule_id integer,
    reward_type character varying(30),
    reward_value text,
    is_opened boolean DEFAULT false NOT NULL,
    opened_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_mystery_boxes OWNER TO postgres;

--
-- Name: shishya_mystery_boxes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_mystery_boxes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_mystery_boxes_id_seq OWNER TO postgres;

--
-- Name: shishya_mystery_boxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_mystery_boxes_id_seq OWNED BY public.shishya_mystery_boxes.id;


--
-- Name: shishya_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_notifications (
    id integer NOT NULL,
    user_id character varying(36),
    role character varying(20) DEFAULT 'all'::character varying NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(30) NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_notifications OWNER TO postgres;

--
-- Name: shishya_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_notifications_id_seq OWNER TO postgres;

--
-- Name: shishya_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_notifications_id_seq OWNED BY public.shishya_notifications.id;


--
-- Name: shishya_otp_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_otp_codes (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_otp_codes OWNER TO postgres;

--
-- Name: shishya_otp_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_otp_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_otp_codes_id_seq OWNER TO postgres;

--
-- Name: shishya_otp_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_otp_codes_id_seq OWNED BY public.shishya_otp_codes.id;


--
-- Name: shishya_otp_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_otp_logs (
    id integer NOT NULL,
    user_id character varying(36),
    contact_type character varying(10) DEFAULT 'email'::character varying NOT NULL,
    destination character varying(255) NOT NULL,
    otp_hash text NOT NULL,
    purpose character varying(20) NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    consumed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_otp_logs OWNER TO postgres;

--
-- Name: shishya_otp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_otp_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_otp_logs_id_seq OWNER TO postgres;

--
-- Name: shishya_otp_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_otp_logs_id_seq OWNED BY public.shishya_otp_logs.id;


--
-- Name: shishya_rule_trigger_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_rule_trigger_logs (
    id integer NOT NULL,
    rule_id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer,
    trigger_count integer DEFAULT 1 NOT NULL,
    actions_executed text NOT NULL,
    input_signals text,
    triggered_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_rule_trigger_logs OWNER TO postgres;

--
-- Name: shishya_rule_trigger_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_rule_trigger_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_rule_trigger_logs_id_seq OWNER TO postgres;

--
-- Name: shishya_rule_trigger_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_rule_trigger_logs_id_seq OWNED BY public.shishya_rule_trigger_logs.id;


--
-- Name: shishya_scholarships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_scholarships (
    id integer NOT NULL,
    scholarship_id character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    discount_percent integer NOT NULL,
    course_id integer,
    max_redemptions integer,
    redemption_count integer DEFAULT 0 NOT NULL,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    rule_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_scholarships OWNER TO postgres;

--
-- Name: shishya_scholarships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_scholarships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_scholarships_id_seq OWNER TO postgres;

--
-- Name: shishya_scholarships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_scholarships_id_seq OWNED BY public.shishya_scholarships.id;


--
-- Name: shishya_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_sessions (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.shishya_sessions OWNER TO postgres;

--
-- Name: TABLE shishya_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_sessions IS 'SHISHYA student portal - session storage';


--
-- Name: shishya_student_streaks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_student_streaks (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_activity_date timestamp without time zone,
    streak_start_date timestamp without time zone,
    total_active_days integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_student_streaks OWNER TO postgres;

--
-- Name: shishya_student_streaks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_student_streaks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_student_streaks_id_seq OWNER TO postgres;

--
-- Name: shishya_student_streaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_student_streaks_id_seq OWNED BY public.shishya_student_streaks.id;


--
-- Name: shishya_user_certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_certificates (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    certificate_id character varying(20) NOT NULL,
    course_id integer NOT NULL,
    course_title text NOT NULL,
    certificate_title text NOT NULL,
    certificate_type character varying(20) NOT NULL,
    level character varying(20) NOT NULL,
    skills text NOT NULL,
    issued_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_certificates OWNER TO postgres;

--
-- Name: shishya_user_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_certificates_id_seq OWNER TO postgres;

--
-- Name: shishya_user_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_certificates_id_seq OWNED BY public.shishya_user_certificates.id;


--
-- Name: shishya_user_credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_credits (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    total_earned integer DEFAULT 0 NOT NULL,
    total_spent integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_credits OWNER TO postgres;

--
-- Name: TABLE shishya_user_credits; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_user_credits IS 'SHISHYA student portal - learning credits';


--
-- Name: shishya_user_credits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_credits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_credits_id_seq OWNER TO postgres;

--
-- Name: shishya_user_credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_credits_id_seq OWNED BY public.shishya_user_credits.id;


--
-- Name: shishya_user_lab_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_lab_progress (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer NOT NULL,
    lab_id integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    user_code text,
    completed_at timestamp without time zone
);


ALTER TABLE public.shishya_user_lab_progress OWNER TO postgres;

--
-- Name: shishya_user_lab_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_lab_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_lab_progress_id_seq OWNER TO postgres;

--
-- Name: shishya_user_lab_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_lab_progress_id_seq OWNED BY public.shishya_user_lab_progress.id;


--
-- Name: shishya_user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_profiles (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    full_name text NOT NULL,
    username character varying(30) NOT NULL,
    bio text,
    profile_photo text,
    headline text,
    location text,
    github_url text,
    linkedin_url text,
    portfolio_visible boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_profiles OWNER TO postgres;

--
-- Name: TABLE shishya_user_profiles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_user_profiles IS 'SHISHYA student portal - user profiles';


--
-- Name: shishya_user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_progress (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_progress OWNER TO postgres;

--
-- Name: shishya_user_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_progress_id_seq OWNER TO postgres;

--
-- Name: shishya_user_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_progress_id_seq OWNED BY public.shishya_user_progress.id;


--
-- Name: shishya_user_project_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_project_submissions (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    project_id integer NOT NULL,
    course_id integer NOT NULL,
    github_url text NOT NULL,
    live_url text,
    notes text,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_project_submissions OWNER TO postgres;

--
-- Name: shishya_user_project_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_project_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_project_submissions_id_seq OWNER TO postgres;

--
-- Name: shishya_user_project_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_project_submissions_id_seq OWNED BY public.shishya_user_project_submissions.id;


--
-- Name: shishya_user_scholarships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_scholarships (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    scholarship_id integer NOT NULL,
    course_id integer,
    is_used boolean DEFAULT false NOT NULL,
    used_at timestamp without time zone,
    awarded_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone
);


ALTER TABLE public.shishya_user_scholarships OWNER TO postgres;

--
-- Name: shishya_user_scholarships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_scholarships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_scholarships_id_seq OWNER TO postgres;

--
-- Name: shishya_user_scholarships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_scholarships_id_seq OWNED BY public.shishya_user_scholarships.id;


--
-- Name: shishya_user_test_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_user_test_attempts (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    test_id integer NOT NULL,
    course_id integer NOT NULL,
    answers text NOT NULL,
    score_percentage integer NOT NULL,
    passed boolean NOT NULL,
    attempted_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_user_test_attempts OWNER TO postgres;

--
-- Name: shishya_user_test_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_user_test_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_user_test_attempts_id_seq OWNER TO postgres;

--
-- Name: shishya_user_test_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_user_test_attempts_id_seq OWNED BY public.shishya_user_test_attempts.id;


--
-- Name: shishya_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_users (
    id character varying(36) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    auth_provider character varying(20) DEFAULT 'email'::character varying,
    auth_provider_id character varying(255)
);


ALTER TABLE public.shishya_users OWNER TO postgres;

--
-- Name: TABLE shishya_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_users IS 'SHISHYA student portal - user accounts';


--
-- Name: shishya_usha_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_usha_conversations (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id integer NOT NULL,
    page_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_usha_conversations OWNER TO postgres;

--
-- Name: TABLE shishya_usha_conversations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shishya_usha_conversations IS 'SHISHYA student portal - Usha AI tutor conversations';


--
-- Name: shishya_usha_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_usha_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_usha_conversations_id_seq OWNER TO postgres;

--
-- Name: shishya_usha_conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_usha_conversations_id_seq OWNED BY public.shishya_usha_conversations.id;


--
-- Name: shishya_usha_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_usha_messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    response_type character varying(30),
    help_level character varying(20),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_usha_messages OWNER TO postgres;

--
-- Name: shishya_usha_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_usha_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_usha_messages_id_seq OWNER TO postgres;

--
-- Name: shishya_usha_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_usha_messages_id_seq OWNED BY public.shishya_usha_messages.id;


--
-- Name: shishya_voucher_redemptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_voucher_redemptions (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    voucher_code character varying(50) NOT NULL,
    points_received integer NOT NULL,
    redeemed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_voucher_redemptions OWNER TO postgres;

--
-- Name: shishya_voucher_redemptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_voucher_redemptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_voucher_redemptions_id_seq OWNER TO postgres;

--
-- Name: shishya_voucher_redemptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_voucher_redemptions_id_seq OWNED BY public.shishya_voucher_redemptions.id;


--
-- Name: shishya_vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shishya_vouchers (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    points integer NOT NULL,
    bonus_percent integer DEFAULT 0,
    max_usage integer DEFAULT 1,
    used_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expiry_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shishya_vouchers OWNER TO postgres;

--
-- Name: shishya_vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shishya_vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shishya_vouchers_id_seq OWNER TO postgres;

--
-- Name: shishya_vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shishya_vouchers_id_seq OWNED BY public.shishya_vouchers.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duration_minutes integer DEFAULT 30 NOT NULL,
    passing_percentage integer DEFAULT 60 NOT NULL,
    questions text NOT NULL,
    max_attempts integer,
    shuffle_questions boolean DEFAULT false NOT NULL,
    show_correct_answers boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tests_id_seq OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: udyog_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    student_id character varying(36) NOT NULL,
    matching_score integer DEFAULT 0,
    status character varying(20) DEFAULT 'applied'::character varying NOT NULL,
    applied_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_applications OWNER TO postgres;

--
-- Name: udyog_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_applications_id_seq OWNER TO postgres;

--
-- Name: udyog_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_applications_id_seq OWNED BY public.udyog_applications.id;


--
-- Name: udyog_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_assignments (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    internship_id integer NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    skill_score integer DEFAULT 0 NOT NULL,
    assigned_role character varying(50),
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    batch_id integer
);


ALTER TABLE public.udyog_assignments OWNER TO postgres;

--
-- Name: udyog_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_assignments_id_seq OWNER TO postgres;

--
-- Name: udyog_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_assignments_id_seq OWNED BY public.udyog_assignments.id;


--
-- Name: udyog_batch_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_batch_members (
    id integer NOT NULL,
    batch_id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    role character varying(50) DEFAULT 'developer'::character varying NOT NULL,
    skill_score integer DEFAULT 0 NOT NULL,
    performance_score integer DEFAULT 0,
    task_completion_rate integer DEFAULT 0,
    deadline_compliance integer DEFAULT 0,
    quality_score integer DEFAULT 0,
    collaboration_score integer DEFAULT 0,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_batch_members OWNER TO postgres;

--
-- Name: udyog_batch_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_batch_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_batch_members_id_seq OWNER TO postgres;

--
-- Name: udyog_batch_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_batch_members_id_seq OWNED BY public.udyog_batch_members.id;


--
-- Name: udyog_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_batches (
    id integer NOT NULL,
    internship_id integer NOT NULL,
    batch_number integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT 'forming'::character varying NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_batches OWNER TO postgres;

--
-- Name: udyog_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_batches_id_seq OWNER TO postgres;

--
-- Name: udyog_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_batches_id_seq OWNED BY public.udyog_batches.id;


--
-- Name: udyog_certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_certificates (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    internship_id integer NOT NULL,
    certificate_id character varying(50) NOT NULL,
    issue_date timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    batch_id integer,
    role character varying(50),
    performance_score integer DEFAULT 0,
    duration character varying(50)
);


ALTER TABLE public.udyog_certificates OWNER TO postgres;

--
-- Name: udyog_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_certificates_id_seq OWNER TO postgres;

--
-- Name: udyog_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_certificates_id_seq OWNED BY public.udyog_certificates.id;


--
-- Name: udyog_hr_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_hr_users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(100) NOT NULL,
    company_name character varying(255) NOT NULL,
    company_website character varying(500),
    designation character varying(100),
    phone character varying(20),
    is_approved boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_hr_users OWNER TO postgres;

--
-- Name: udyog_hr_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_hr_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_hr_users_id_seq OWNER TO postgres;

--
-- Name: udyog_hr_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_hr_users_id_seq OWNED BY public.udyog_hr_users.id;


--
-- Name: udyog_internships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_internships (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    short_description character varying(500),
    skill_level character varying(20) DEFAULT 'beginner'::character varying NOT NULL,
    domain character varying(100),
    duration character varying(50) DEFAULT '4 weeks'::character varying NOT NULL,
    max_participants integer DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    required_skills text,
    milestones text,
    batch_size integer DEFAULT 5 NOT NULL
);


ALTER TABLE public.udyog_internships OWNER TO postgres;

--
-- Name: udyog_internships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_internships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_internships_id_seq OWNER TO postgres;

--
-- Name: udyog_internships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_internships_id_seq OWNED BY public.udyog_internships.id;


--
-- Name: udyog_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_jobs (
    id integer NOT NULL,
    hr_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    required_skills text,
    internship_required boolean DEFAULT false NOT NULL,
    min_skill_score integer DEFAULT 0,
    location character varying(255),
    salary_range character varying(100),
    job_type character varying(50) DEFAULT 'full-time'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    deadline timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_jobs OWNER TO postgres;

--
-- Name: udyog_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_jobs_id_seq OWNER TO postgres;

--
-- Name: udyog_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_jobs_id_seq OWNED BY public.udyog_jobs.id;


--
-- Name: udyog_skill_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_skill_assessments (
    id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    domain character varying(100) NOT NULL,
    score integer NOT NULL,
    level character varying(20) NOT NULL,
    assessed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udyog_skill_assessments OWNER TO postgres;

--
-- Name: udyog_skill_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_skill_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_skill_assessments_id_seq OWNER TO postgres;

--
-- Name: udyog_skill_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_skill_assessments_id_seq OWNED BY public.udyog_skill_assessments.id;


--
-- Name: udyog_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_submissions (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    task_id integer,
    content text,
    file_url text,
    feedback text,
    ai_feedback text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone,
    batch_id integer,
    user_id character varying(36),
    score integer DEFAULT 0,
    approved boolean DEFAULT false
);


ALTER TABLE public.udyog_submissions OWNER TO postgres;

--
-- Name: udyog_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_submissions_id_seq OWNER TO postgres;

--
-- Name: udyog_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_submissions_id_seq OWNED BY public.udyog_submissions.id;


--
-- Name: udyog_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udyog_tasks (
    id integer NOT NULL,
    internship_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'todo'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    batch_id integer,
    assigned_to character varying(36),
    score integer DEFAULT 0,
    max_score integer DEFAULT 100,
    due_date timestamp without time zone
);


ALTER TABLE public.udyog_tasks OWNER TO postgres;

--
-- Name: udyog_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udyog_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udyog_tasks_id_seq OWNER TO postgres;

--
-- Name: udyog_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udyog_tasks_id_seq OWNED BY public.udyog_tasks.id;


--
-- Name: zoho_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zoho_tokens (
    id integer NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    scope text,
    api_domain character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.zoho_tokens OWNER TO postgres;

--
-- Name: zoho_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.zoho_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.zoho_tokens_id_seq OWNER TO postgres;

--
-- Name: zoho_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.zoho_tokens_id_seq OWNED BY public.zoho_tokens.id;


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: guru_admin_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru_admin_users ALTER COLUMN id SET DEFAULT nextval('public.guru_admin_users_id_seq'::regclass);


--
-- Name: labs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs ALTER COLUMN id SET DEFAULT nextval('public.labs_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: pricing_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_plans ALTER COLUMN id SET DEFAULT nextval('public.pricing_plans_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: shishya_ai_nudge_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_ai_nudge_logs ALTER COLUMN id SET DEFAULT nextval('public.shishya_ai_nudge_logs_id_seq'::regclass);


--
-- Name: shishya_course_enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_course_enrollments ALTER COLUMN id SET DEFAULT nextval('public.shishya_course_enrollments_id_seq'::regclass);


--
-- Name: shishya_credit_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_credit_transactions ALTER COLUMN id SET DEFAULT nextval('public.shishya_credit_transactions_id_seq'::regclass);


--
-- Name: shishya_gift_boxes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_gift_boxes ALTER COLUMN id SET DEFAULT nextval('public.shishya_gift_boxes_id_seq'::regclass);


--
-- Name: shishya_marksheet_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheet_verifications ALTER COLUMN id SET DEFAULT nextval('public.shishya_marksheet_verifications_id_seq'::regclass);


--
-- Name: shishya_marksheets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheets ALTER COLUMN id SET DEFAULT nextval('public.shishya_marksheets_id_seq'::regclass);


--
-- Name: shishya_motivation_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_cards ALTER COLUMN id SET DEFAULT nextval('public.shishya_motivation_cards_id_seq'::regclass);


--
-- Name: shishya_motivation_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_rules ALTER COLUMN id SET DEFAULT nextval('public.shishya_motivation_rules_id_seq'::regclass);


--
-- Name: shishya_mystery_boxes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_mystery_boxes ALTER COLUMN id SET DEFAULT nextval('public.shishya_mystery_boxes_id_seq'::regclass);


--
-- Name: shishya_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_notifications ALTER COLUMN id SET DEFAULT nextval('public.shishya_notifications_id_seq'::regclass);


--
-- Name: shishya_otp_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_codes ALTER COLUMN id SET DEFAULT nextval('public.shishya_otp_codes_id_seq'::regclass);


--
-- Name: shishya_otp_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_logs ALTER COLUMN id SET DEFAULT nextval('public.shishya_otp_logs_id_seq'::regclass);


--
-- Name: shishya_rule_trigger_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_rule_trigger_logs ALTER COLUMN id SET DEFAULT nextval('public.shishya_rule_trigger_logs_id_seq'::regclass);


--
-- Name: shishya_scholarships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_scholarships ALTER COLUMN id SET DEFAULT nextval('public.shishya_scholarships_id_seq'::regclass);


--
-- Name: shishya_student_streaks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_student_streaks ALTER COLUMN id SET DEFAULT nextval('public.shishya_student_streaks_id_seq'::regclass);


--
-- Name: shishya_user_certificates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_certificates ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_certificates_id_seq'::regclass);


--
-- Name: shishya_user_credits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_credits ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_credits_id_seq'::regclass);


--
-- Name: shishya_user_lab_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_lab_progress ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_lab_progress_id_seq'::regclass);


--
-- Name: shishya_user_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_progress ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_progress_id_seq'::regclass);


--
-- Name: shishya_user_project_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_project_submissions ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_project_submissions_id_seq'::regclass);


--
-- Name: shishya_user_scholarships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_scholarships ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_scholarships_id_seq'::regclass);


--
-- Name: shishya_user_test_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_test_attempts ALTER COLUMN id SET DEFAULT nextval('public.shishya_user_test_attempts_id_seq'::regclass);


--
-- Name: shishya_usha_conversations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_conversations ALTER COLUMN id SET DEFAULT nextval('public.shishya_usha_conversations_id_seq'::regclass);


--
-- Name: shishya_usha_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_messages ALTER COLUMN id SET DEFAULT nextval('public.shishya_usha_messages_id_seq'::regclass);


--
-- Name: shishya_voucher_redemptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_voucher_redemptions ALTER COLUMN id SET DEFAULT nextval('public.shishya_voucher_redemptions_id_seq'::regclass);


--
-- Name: shishya_vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_vouchers ALTER COLUMN id SET DEFAULT nextval('public.shishya_vouchers_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Name: udyog_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_applications ALTER COLUMN id SET DEFAULT nextval('public.udyog_applications_id_seq'::regclass);


--
-- Name: udyog_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_assignments ALTER COLUMN id SET DEFAULT nextval('public.udyog_assignments_id_seq'::regclass);


--
-- Name: udyog_batch_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batch_members ALTER COLUMN id SET DEFAULT nextval('public.udyog_batch_members_id_seq'::regclass);


--
-- Name: udyog_batches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batches ALTER COLUMN id SET DEFAULT nextval('public.udyog_batches_id_seq'::regclass);


--
-- Name: udyog_certificates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates ALTER COLUMN id SET DEFAULT nextval('public.udyog_certificates_id_seq'::regclass);


--
-- Name: udyog_hr_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_hr_users ALTER COLUMN id SET DEFAULT nextval('public.udyog_hr_users_id_seq'::regclass);


--
-- Name: udyog_internships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_internships ALTER COLUMN id SET DEFAULT nextval('public.udyog_internships_id_seq'::regclass);


--
-- Name: udyog_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_jobs ALTER COLUMN id SET DEFAULT nextval('public.udyog_jobs_id_seq'::regclass);


--
-- Name: udyog_skill_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_skill_assessments ALTER COLUMN id SET DEFAULT nextval('public.udyog_skill_assessments_id_seq'::regclass);


--
-- Name: udyog_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions ALTER COLUMN id SET DEFAULT nextval('public.udyog_submissions_id_seq'::regclass);


--
-- Name: udyog_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_tasks ALTER COLUMN id SET DEFAULT nextval('public.udyog_tasks_id_seq'::regclass);


--
-- Name: zoho_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zoho_tokens ALTER COLUMN id SET DEFAULT nextval('public.zoho_tokens_id_seq'::regclass);


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, short_description, level, duration, skills, status, is_free, credit_cost, test_required, project_required, thumbnail_url, instructor_id, created_at, updated_at, language, is_active, price, currency, published_at, zoho_id, category, group_title, trainer_central_course_url, rating, total_students) FROM stdin;
1	Introduction to Web Development	Learn the fundamentals of web development including HTML, CSS, and JavaScript. Build your first responsive website from scratch.	\N	beginner	8 hours	HTML5,CSS3,JavaScript,Responsive Design,Git Basics	published	t	0	t	t	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:17.933019	en	t	0	INR	\N	\N	\N	\N	\N	\N	0
2	React Fundamentals	Master React.js from the ground up. Learn components, state management, hooks, and build modern user interfaces.	\N	intermediate	12 hours	React,JSX,Hooks,State Management,Component Design	published	f	120	t	t	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:18.03461	en	t	1200	INR	\N	\N	\N	\N	\N	\N	0
3	Advanced TypeScript Patterns	Deep dive into TypeScript advanced features. Learn generics, utility types, decorators, and design patterns for large-scale applications.	\N	advanced	10 hours	TypeScript,Generics,Design Patterns,Type Safety,Advanced Types	published	f	200	t	f	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:18.091419	en	t	2000	INR	\N	\N	\N	\N	\N	\N	0
4	Python for Data Science	Learn Python programming with a focus on data science. Cover NumPy, Pandas, and data visualization techniques.	\N	beginner	15 hours	Python,NumPy,Pandas,Data Visualization,Statistics	published	t	0	t	t	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:18.135428	en	t	0	INR	\N	\N	\N	\N	\N	\N	0
5	Node.js Backend Development	Build scalable backend applications with Node.js and Express. Learn REST APIs, database integration, and authentication.	\N	intermediate	14 hours	Node.js,Express,REST APIs,MongoDB,Authentication	published	f	150	t	t	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:18.174949	en	t	1500	INR	\N	\N	\N	\N	\N	\N	0
6	Cloud Architecture with AWS	Master AWS cloud services and architecture patterns. Deploy, scale, and manage applications in the cloud.	\N	advanced	20 hours	AWS,EC2,S3,Lambda,CloudFormation,DevOps	published	f	300	t	t	\N	\N	2026-01-08 14:08:25.902873	2026-01-08 14:38:18.220798	en	t	3000	INR	\N	\N	\N	\N	\N	\N	0
11	English	abcdefgh	\N	beginner	\N	\N	published	f	100	f	f	\N	\N	2026-02-20 16:27:27.537932	2026-02-20 16:27:27.537932	en	t	0	INR	\N	23063000000039003	General	\N	https://shishya.trainercentralsite.in/clientapp/app/course/23063000000039003/course-details	\N	0
10	Masters in Python with 5 Real-World Projects - Hindi	A comprehensive course designed to take you from beginner to advanced Python programming, culminating in the development of five real-world projects.	\N	masters	\N	\N	published	f	100	f	f	https://lh3.googleusercontent.com/d/1aNSMSLd17YJkfvzQ7zr-wQXhbyvhA5aJ	\N	2026-02-19 11:54:28.184612	2026-02-20 16:27:28.459	hi	t	0	INR	\N	23063000000031034	General	Masters in Python	https://shishya.trainercentralsite.in/clientapp/app/course/23063000000031034/course-details	\N	0
9	Masters in Python	A comprehensive course designed to take you from beginner to advanced Python programming, culminating in the development of five real-world projects.	\N	beginner	\N	\N	published	f	100	f	f		\N	2026-02-18 17:09:04.964306	2026-02-20 16:27:35.475	en	t	0	INR	\N	23063000000028276	General	Masters in Python	https://shishya.trainercentralsite.in/clientapp/app/course/23063000000028276/course-details	\N	0
8	Masters in Python with 5 Real-World Projects	A comprehensive course designed to take you from beginner to advanced Python programming, culminating in the development of five real-world projects.	\N	beginner	\N	\N	published	f	100	f	f	https://lh3.googleusercontent.com/d/1aNSMSLd17YJkfvzQ7zr-wQXhbyvhA5aJ	\N	2026-02-18 16:53:08.930981	2026-02-20 16:27:42.848	en	t	0	INR	\N	23063000000007005	General	Masters in Python	https://shishya.trainercentralsite.in/clientapp/app/course/23063000000007005/course-details	\N	0
\.


--
-- Data for Name: guru_admin_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guru_admin_sessions (id, admin_id, created_at, expires_at) FROM stdin;
42179409-6f19-4316-8258-87702794ee2b	1	2026-02-18 13:09:24.904423	2026-02-25 13:09:24.903
0438d958-ac81-4989-bb47-3e06cd671584	1	2026-02-18 13:10:10.046816	2026-02-25 13:10:10.046
81123019-fef1-4b02-98ba-808795cc6abe	1	2026-02-18 13:30:24.200075	2026-02-25 13:30:24.198
a6f60379-7d94-4379-8b1e-396d26993330	1	2026-02-18 13:46:44.408161	2026-02-25 13:46:44.406
c54750a3-bd50-4c1d-8cb3-9de2810933bd	1	2026-02-18 13:57:13.872719	2026-02-25 13:57:13.87
eeb7a88b-a0ad-47a0-8739-7c122c42cc84	1	2026-02-18 16:31:25.399694	2026-02-25 16:31:25.398
632e6b76-0bf1-4ab8-ae44-a0d2e13e9155	1	2026-02-18 17:04:25.367175	2026-02-25 17:04:25.365
d896f6ae-9705-422b-9fef-6a644fc3e7d2	1	2026-02-18 17:05:54.093437	2026-02-25 17:05:54.092
a70531ef-debb-4f95-b4a5-331c670293db	1	2026-02-18 17:11:40.842177	2026-02-25 17:11:40.841
bcaa24c9-8f3c-4221-9c1d-28f53a79eed4	1	2026-02-18 17:29:38.848906	2026-02-25 17:29:38.847
6576d9b6-50f0-49c0-9801-a36b0270e287	1	2026-02-18 18:01:33.128326	2026-02-25 18:01:33.126
3cb8e0db-bcce-499f-85d6-4a37cdda7911	1	2026-02-18 18:09:05.226342	2026-02-25 18:09:05.225
c592ed9a-0d93-410d-9f2a-44e06cd3508d	1	2026-02-18 18:09:10.776759	2026-02-25 18:09:10.775
87490083-67e6-4ac6-8e21-406194964305	1	2026-02-18 18:09:15.817667	2026-02-25 18:09:15.816
a5af8c13-08e4-41c0-ba25-4920ff6a87be	1	2026-02-18 18:30:39.997741	2026-02-25 18:30:39.996
e49f837b-d9e6-4a66-a755-87a4032fecde	1	2026-02-19 08:31:53.139533	2026-02-26 08:31:53.138
691a101f-b4bc-4725-af1c-088af3ddcf9b	1	2026-02-19 08:36:09.764532	2026-02-26 08:36:09.763
7d93f356-3303-4601-8503-d2337cd144e4	1	2026-02-19 08:36:41.165803	2026-02-26 08:36:41.165
0d915594-a6d6-4f04-a0a7-76095f283020	1	2026-02-19 08:38:38.444986	2026-02-26 08:38:38.443
0ec4bab4-1f22-49f2-baef-9b8a03273965	1	2026-02-19 10:27:46.531197	2026-02-26 10:27:46.529
1b2b0110-c570-455c-a28a-251caade89d5	1	2026-02-19 10:28:50.213995	2026-02-26 10:28:50.212
7fa87dab-5ac1-44a7-a646-cf9e75e24c6a	1	2026-02-19 10:32:57.441863	2026-02-26 10:32:57.44
2452d1c2-1ecc-44f5-b678-adffd9f466ec	1	2026-02-19 10:38:17.97809	2026-02-26 10:38:17.976
5d67cb46-5eb9-4960-8cce-8c7a0747e81d	1	2026-02-19 10:40:38.767201	2026-02-26 10:40:38.766
be634d26-486b-4f78-b707-f0453c33b191	1	2026-02-19 10:42:46.824682	2026-02-26 10:42:46.823
5fb35a9d-b8f0-45dc-8695-3a6df473875a	1	2026-02-20 13:54:01.204421	2026-02-27 13:54:01.203
d4272e02-711b-4931-a10e-a0046a38569c	1	2026-02-20 13:58:25.926539	2026-02-27 13:58:25.924
8b9b056a-bdc5-404a-b28c-c9c0b7315453	1	2026-02-20 16:16:49.216836	2026-02-27 16:16:49.215
14c301b1-b904-48cd-97b3-9c9669ac80f9	1	2026-02-21 18:03:44.286909	2026-02-28 18:03:44.285
a15e4d46-2a14-4966-af3f-bcd00cd22d2b	1	2026-02-23 17:00:36.143677	2026-03-02 17:00:36.142
a6614bab-072e-4568-8931-c6e7fe6d5d15	1	2026-02-24 06:33:13.035814	2026-03-03 06:33:13.034
\.


--
-- Data for Name: guru_admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guru_admin_users (id, email, password_hash, name, role, is_active, last_login_at, created_at) FROM stdin;
1	admin@ourshiksha.com	$2b$12$mF.clnQMSxnlM1t2cU7feO5jIMV4mVgzK3SuhbIN.COs1Jq9QLA3O	OurShiksha Admin	admin	t	2026-02-24 09:11:43.207	2026-02-18 13:04:41.435977
2	dishabrooms@gmail.com	$2b$12$HvHhNA374ZkkT/1mvfYYD.KJCdBhH.RzwX9VEnNM8LBwbPcb2.V1O	Guru	admin	t	2026-02-25 11:20:59.358	2026-02-25 11:20:26.390287
\.


--
-- Data for Name: labs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labs (id, course_id, lesson_id, title, instructions, starter_code, expected_output, solution_code, language, order_index, created_at) FROM stdin;
1	1	9	Variables and Output	Declare a variable called 'greeting' and set it to 'Hello, World!'\nDeclare a variable called 'number' and set it to 42\nUse console.log() to print the greeting\nUse console.log() to print the number	// Declare your variables below\n// greeting should be "Hello, World!"\n// number should be 42\n\n// Print the greeting\n\n// Print the number\n	Hello, World!\n42	\N	javascript	1	2026-01-08 14:09:37.905436
2	1	9	Basic Math Operations	Create two variables: a = 10 and b = 5\nCalculate and log the sum of a and b\nCalculate and log the product of a and b\nCalculate and log a divided by b	// Declare variables a and b\n\n// Calculate and log the sum\n\n// Calculate and log the product\n\n// Calculate and log the division\n	15\n50\n2	\N	javascript	2	2026-01-08 14:09:37.905436
3	1	10	Creating Functions	Create a function called 'greet' that takes a name parameter\nThe function should return 'Hello, [name]!'\nCall the function with 'Alice' and log the result\nCall the function with 'Bob' and log the result	// Create the greet function\n\n\n// Call greet with 'Alice' and log it\n\n// Call greet with 'Bob' and log it\n	Hello, Alice!\nHello, Bob!	\N	javascript	3	2026-01-08 14:09:37.905436
4	1	12	Working with Arrays	Create an array called 'fruits' with: 'apple', 'banana', 'orange'\nLog the first element of the array\nLog the length of the array\nAdd 'grape' to the end of the array\nLog the updated array	// Create the fruits array\n\n// Log the first element\n\n// Log the length\n\n// Add 'grape' to the array\n\n// Log the updated array\n	apple\n3\n["apple", "banana", "orange", "grape"]	\N	javascript	4	2026-01-08 14:09:37.905436
5	1	12	Array Methods - Map	Create an array called 'numbers' with values [1, 2, 3, 4, 5]\nUse map() to create a new array 'doubled' with each number multiplied by 2\nLog the doubled array	const numbers = [1, 2, 3, 4, 5];\n\n// Use map to double each number\n\n// Log the doubled array\n	[2, 4, 6, 8, 10]	\N	javascript	5	2026-01-08 14:09:37.905436
6	1	12	Array Methods - Filter	Given the numbers array [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nUse filter() to create 'evenNumbers' containing only even numbers\nLog the evenNumbers array	const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n// Use filter to get even numbers\n\n// Log the even numbers\n	[2, 4, 6, 8, 10]	\N	javascript	6	2026-01-08 14:09:37.905436
7	1	11	DOM Selection	Use document.getElementById to select an element\nUse document.querySelector to select by class\nLog both elements to console	// Use getElementById for element with id "header"\n\n// Use querySelector for element with class "content"\n	[object HTMLDivElement]\n[object HTMLDivElement]	\N	javascript	7	2026-01-08 14:10:17.945565
8	1	11	Event Handling	Create a click handler function\nAdd an event listener to a button\nLog "Button clicked!" when clicked	// Create the click handler function\n\n// Add event listener to button\n	Button clicked!	\N	javascript	8	2026-01-08 14:10:17.945565
9	2	16	First React Component	Create a functional component called Greeting\nReturn a div with text "Hello, React!"\nExport the component	function Greeting() {\n  // Return JSX here\n}\n\nconsole.log(Greeting());\n	<div>Hello, React!</div>	\N	javascript	1	2026-01-08 14:10:17.945565
10	2	17	Component with Props	Create a Welcome component that accepts a name prop\nDisplay "Welcome, {name}!" in the component\nTest with name="Student"	function Welcome(props) {\n  // Use props.name\n}\n\nconsole.log(Welcome({ name: "Student" }));\n	<h1>Welcome, Student!</h1>	\N	javascript	2	2026-01-08 14:10:17.945565
11	2	19	Passing Props	Create a Card component with title and content props\nRender both props in the component\nStyle with className	function Card({ title, content }) {\n  // Return card JSX\n}\n\nconsole.log(Card({ title: "My Card", content: "Card content here" }));\n	<div class="card"><h2>My Card</h2><p>Card content here</p></div>	\N	javascript	3	2026-01-08 14:10:17.945565
12	2	22	Using useState	Create a Counter component\nUse useState to track count\nAdd increment button	function Counter() {\n  // Implement useState and return JSX\n}\n	Count: 0	\N	javascript	4	2026-01-08 14:10:17.945565
13	3	\N	Generic Functions	Create a generic identity function\nTest with number and string types\nLog the results	function identity<T>(arg: T): T {\n  // Implement here\n}\n\nconsole.log(identity(5));\nconsole.log(identity("hello"));\n	5\nhello	\N	javascript	1	2026-01-08 14:10:37.287292
14	3	\N	Generic Arrays	Create a function that returns the first element of any array\nUse generics for type safety\nTest with different array types	function first<T>(arr: T[]): T {\n  // Return first element\n}\n\nconsole.log(first([1, 2, 3]));\nconsole.log(first(["a", "b", "c"]));\n	1\na	\N	javascript	2	2026-01-08 14:10:37.287292
15	4	\N	Python Variables	Create variables for name, age, and is_student\nPrint all variables with labels	// Simulate Python-style variables\nlet name = "Alice";\nlet age = 25;\nlet is_student = true;\n\nconsole.log("Name:", name);\nconsole.log("Age:", age);\nconsole.log("Is Student:", is_student);\n	Name: Alice\nAge: 25\nIs Student: true	\N	javascript	1	2026-01-08 14:10:37.287292
16	4	\N	Python Lists	Create a list of numbers\nFind the sum and average\nPrint the results	let numbers = [10, 20, 30, 40, 50];\n// Calculate sum and average\n	Sum: 150\nAverage: 30	\N	javascript	2	2026-01-08 14:10:37.287292
17	5	\N	Express Route	Create a simple GET endpoint\nReturn JSON response\nLog request received	// Simulate Express route handler\nfunction handleGet(req, res) {\n  console.log("Request received");\n  return { message: "Hello from API" };\n}\n\nconsole.log(JSON.stringify(handleGet()));\n	Request received\n{"message":"Hello from API"}	\N	javascript	1	2026-01-08 14:10:37.287292
18	5	\N	REST API Response	Create a user object\nReturn as JSON response\nInclude status code	function getUser() {\n  const user = { id: 1, name: "John", email: "john@example.com" };\n  return { status: 200, data: user };\n}\n\nconsole.log(JSON.stringify(getUser()));\n	{"status":200,"data":{"id":1,"name":"John","email":"john@example.com"}}	\N	javascript	2	2026-01-08 14:10:37.287292
19	6	\N	S3 Bucket Config	Create an S3 bucket configuration object\nInclude bucket name and region\nAdd versioning enabled	const s3Config = {\n  // Add configuration\n};\n\nconsole.log(JSON.stringify(s3Config, null, 2));\n	{"bucketName":"my-bucket","region":"us-east-1","versioning":true}	\N	javascript	1	2026-01-08 14:10:37.287292
20	6	\N	Lambda Function	Create a Lambda handler function\nProcess event and return response\nInclude statusCode and body	async function handler(event) {\n  // Process event and return response\n}\n\nhandler({ name: "test" }).then(r => console.log(JSON.stringify(r)));\n	{"statusCode":200,"body":"Hello, test!"}	\N	javascript	2	2026-01-08 14:10:37.287292
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, module_id, course_id, title, content, video_url, duration_minutes, order_index, is_preview, created_at, trainer_central_url) FROM stdin;
1	1	1	What is HTML?	HTML (HyperText Markup Language) is the standard markup language for creating web pages.	\N	20	1	t	2026-01-08 14:09:13.331116	\N
2	1	1	HTML Document Structure	Learn about DOCTYPE, head, and body sections.	\N	25	2	f	2026-01-08 14:09:13.331116	\N
3	1	1	Common HTML Elements	Headings, paragraphs, links, images, and lists.	\N	30	3	f	2026-01-08 14:09:13.331116	\N
4	1	1	Forms and Input Elements	Create HTML forms with various input types.	\N	35	4	f	2026-01-08 14:09:13.331116	\N
5	2	1	Introduction to CSS	CSS purpose, syntax, and applying styles.	\N	25	1	f	2026-01-08 14:09:13.331116	\N
6	2	1	CSS Box Model	Content, padding, border, and margin.	\N	30	2	f	2026-01-08 14:09:13.331116	\N
7	2	1	Flexbox Layout	Create flexible layouts with flexbox.	\N	35	3	f	2026-01-08 14:09:13.331116	\N
8	2	1	Responsive Design	Media queries and mobile-first design.	\N	30	4	f	2026-01-08 14:09:13.331116	\N
9	3	1	JavaScript Basics	Variables, data types, and operators.	\N	30	1	f	2026-01-08 14:09:13.331116	\N
10	3	1	Functions and Scope	Create functions and understand scope.	\N	35	2	f	2026-01-08 14:09:13.331116	\N
11	3	1	DOM Manipulation	Select and modify DOM elements.	\N	40	3	f	2026-01-08 14:09:13.331116	\N
12	3	1	Working with Arrays	Array methods and iteration.	\N	35	4	f	2026-01-08 14:09:13.331116	\N
13	4	1	Project Setup	Plan your website and set up structure.	\N	15	1	f	2026-01-08 14:09:13.331116	\N
14	4	1	Building the Homepage	Create layout and navigation.	\N	25	2	f	2026-01-08 14:09:13.331116	\N
15	4	1	Adding Interactivity	JavaScript functionality and user input.	\N	20	3	f	2026-01-08 14:09:13.331116	\N
16	5	2	What is React?	Component-based architecture and virtual DOM.	\N	30	1	t	2026-01-08 14:09:13.331116	\N
17	5	2	Your First Component	Create and render React components.	\N	35	2	f	2026-01-08 14:09:13.331116	\N
18	5	2	Styling in React	CSS modules and styled-components.	\N	30	3	f	2026-01-08 14:09:13.331116	\N
19	6	2	Understanding Props	Pass data to components with props.	\N	35	1	f	2026-01-08 14:09:13.331116	\N
20	6	2	Component Composition	Compose and reuse components.	\N	40	2	f	2026-01-08 14:09:13.331116	\N
21	6	2	Conditional Rendering	Render content conditionally.	\N	30	3	f	2026-01-08 14:09:13.331116	\N
22	7	2	Introduction to State	useState hook and state updates.	\N	35	1	f	2026-01-08 14:09:13.331116	\N
23	7	2	useEffect Hook	Side effects and cleanup.	\N	40	2	f	2026-01-08 14:09:13.331116	\N
24	7	2	Lifting State Up	Share state between components.	\N	35	3	f	2026-01-08 14:09:13.331116	\N
25	8	2	useContext Hook	Context API for global state.	\N	40	1	f	2026-01-08 14:09:13.331116	\N
26	8	2	useReducer Hook	Complex state with reducers.	\N	45	2	f	2026-01-08 14:09:13.331116	\N
27	8	2	Custom Hooks	Create and share custom hooks.	\N	40	3	f	2026-01-08 14:09:13.331116	\N
28	9	3	Generic Functions	Create generic functions with type parameters.	\N	40	1	t	2026-01-08 14:11:59.606169	\N
29	9	3	Generic Classes	Build generic classes for reusable code.	\N	45	2	f	2026-01-08 14:11:59.606169	\N
30	10	3	Partial and Required	Use Partial and Required utility types.	\N	30	1	f	2026-01-08 14:11:59.606169	\N
31	10	3	Pick and Omit	Select or exclude properties with Pick and Omit.	\N	30	2	f	2026-01-08 14:11:59.606169	\N
32	11	3	Singleton Pattern	Implement the Singleton pattern in TypeScript.	\N	35	1	f	2026-01-08 14:11:59.606169	\N
33	11	3	Factory Pattern	Create objects with the Factory pattern.	\N	40	2	f	2026-01-08 14:11:59.606169	\N
34	12	3	Building Type-Safe APIs	Design type-safe API interfaces.	\N	45	1	f	2026-01-08 14:11:59.606169	\N
35	13	4	Python Basics	Variables, data types, and operators in Python.	\N	35	1	t	2026-01-08 14:11:59.606169	\N
36	13	4	Control Flow	If statements, loops, and conditions.	\N	40	2	f	2026-01-08 14:11:59.606169	\N
37	13	4	Functions in Python	Define and use functions.	\N	35	3	f	2026-01-08 14:11:59.606169	\N
38	14	4	NumPy Arrays	Create and manipulate NumPy arrays.	\N	45	1	f	2026-01-08 14:11:59.606169	\N
39	14	4	Array Operations	Perform mathematical operations on arrays.	\N	40	2	f	2026-01-08 14:11:59.606169	\N
40	15	4	DataFrames Basics	Create and explore DataFrames.	\N	45	1	f	2026-01-08 14:11:59.606169	\N
41	15	4	Data Manipulation	Filter, sort, and transform data.	\N	50	2	f	2026-01-08 14:11:59.606169	\N
42	16	4	Matplotlib Basics	Create basic plots with Matplotlib.	\N	40	1	f	2026-01-08 14:11:59.606169	\N
43	17	5	Node.js Introduction	What is Node.js and how it works.	\N	30	1	t	2026-01-08 14:11:59.606169	\N
44	17	5	Modules and NPM	Using modules and package management.	\N	35	2	f	2026-01-08 14:11:59.606169	\N
45	18	5	Express Basics	Set up an Express server.	\N	40	1	f	2026-01-08 14:11:59.606169	\N
46	18	5	Routing	Create routes and handle requests.	\N	45	2	f	2026-01-08 14:11:59.606169	\N
47	19	5	MongoDB Basics	Connect and query MongoDB.	\N	50	1	f	2026-01-08 14:11:59.606169	\N
48	19	5	SQL with Node.js	Use PostgreSQL with Node.js.	\N	45	2	f	2026-01-08 14:11:59.606169	\N
49	20	5	JWT Authentication	Implement JWT-based auth.	\N	50	1	f	2026-01-08 14:11:59.606169	\N
50	21	6	Introduction to AWS	Overview of AWS services.	\N	40	1	t	2026-01-08 14:11:59.606169	\N
51	21	6	IAM Basics	Identity and Access Management.	\N	45	2	f	2026-01-08 14:11:59.606169	\N
52	22	6	EC2 Instances	Launch and manage EC2 instances.	\N	50	1	f	2026-01-08 14:11:59.606169	\N
53	22	6	Lambda Functions	Create serverless functions.	\N	55	2	f	2026-01-08 14:11:59.606169	\N
54	23	6	S3 Storage	Use S3 for object storage.	\N	45	1	f	2026-01-08 14:11:59.606169	\N
55	23	6	RDS Databases	Managed relational databases.	\N	50	2	f	2026-01-08 14:11:59.606169	\N
56	24	6	CloudFormation Basics	Define infrastructure with templates.	\N	55	1	f	2026-01-08 14:11:59.606169	\N
372	100	11	L1	abcd	\N	\N	1	t	2026-02-20 16:27:28.450186	\N
373	101	10	Getting Started with Python	<div>Welcome to 'Getting Started with Python,' the first lesson in the 'Masters in Python with 5 Real-World Projects' course! In this lesson, we will delve into the fundamentals of Python programming, setting a solid foundation for your journey into the world of coding. Whether you are a complete beginner or looking to brush up on your skills, this lesson is designed to equip you with the essential knowledge and tools to start programming in Python.<br></div><div><br></div><div>### 1. Introduction to Python<br></div><div>Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, Python has gained immense popularity among developers due to its versatility and ease of use. It is widely used in various domains, including web development, data analysis, artificial intelligence, scientific computing, and more.<br></div><div><br></div><div>### 2. Why Learn Python?<br></div><div>- **Easy to Read and Write**: Python's syntax is clear and intuitive, making it an excellent choice for beginners.<br></div><div>- **Versatile**: Python can be used for a wide range of applications, from simple scripts to complex machine learning algorithms.<br></div><div>- **Strong Community Support**: Python has a large and active community, providing extensive libraries and frameworks that can help you solve problems more efficiently.<br></div><div>- **Career Opportunities**: Proficiency in Python opens doors to numerous job opportunities in various fields, including software development, data science, and automation.<br></div><div><br></div><div>### 3. Setting Up Your Python Environment<br></div><div>Before you start coding, you need to set up your development environment. Here’s how:<br></div><div>- **Download and Install Python**: Visit the official Python website (https://www.python.org/downloads/) and download the latest version for your operating system. Follow the installation instructions.<br></div><div>- **Choose an Integrated Development Environment (IDE)**: While you can write Python code in any text editor, using an IDE can enhance your coding experience. Popular choices include:<br></div><div>  - **PyCharm**: A powerful IDE specifically for Python.<br></div><div>  - **Visual Studio Code**: A lightweight editor with Python support through extensions.<br></div><div>  - **Jupyter Notebook**: Ideal for data analysis and visualization, allowing you to create interactive notebooks.<br></div><div><br></div><div>### 4. Your First Python Program<br></div><div>Let’s write a simple Python program to get you started:<br></div><div>```python<br></div><div>print('Hello, World!')<br></div><div>```<br></div><div>This program uses the `print()` function to display the text 'Hello, World!' on the screen. To run this program:<br></div><div>1. Open your chosen IDE.<br></div><div>2. Create a new Python file (e.g., `hello.py`).<br></div><div>3. Type the code above and save the file.<br></div><div>4. Run the program by executing the command `python hello.py` in your terminal or using the run option in your IDE.<br></div><div><br></div><div>### 5. Understanding Python Basics<br></div><div>Before diving deeper, it's crucial to understand some basic concepts:<br></div><div>- **Variables**: Store data values. Example: `name = 'Alice'`<br></div><div>- **Data Types**: Python has several built-in data types, including integers, floats, strings, and lists.<br></div><div>- **Control Structures**: Learn about conditionals (`if`, `else`) and loops (`for`, `while`) to control the flow of your program.<br></div><div>- **Functions**: Functions allow you to encapsulate code for reuse. Example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    print(f'Hello, {name}!')<br></div><div>```<br></div><div><br></div><div>### 6. Next Steps<br></div><div>Congratulations on taking the first step in your Python journey! In the next lessons, we will explore more advanced topics, including data structures, object-oriented programming, and libraries that will enable you to work on real-world projects. Make sure to practice coding regularly and engage with the Python community through forums and coding challenges.<br></div><div><br></div><div>### 7. Resources for Further Learning<br></div><div>- **Official Python Documentation**: https://docs.python.org/3/<br></div><div>- **Codecademy Python Course**: A great interactive platform to learn Python basics.<br></div><div>- **LeetCode**: Practice coding problems to enhance your problem-solving skills.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this lesson, you have laid the groundwork for a successful learning experience in Python. Remember, the key to mastering programming is consistent practice and exploration. Embrace the challenges ahead and enjoy your programming journey!</div>	https://youtube.com/embed/t2_Q2BRzeEE	\N	1	t	2026-02-20 16:27:35.317274	https://our-shiksha.trainercentral.in/course/attend?previouspage=clientapp#/course/23063000000031034/attend/section/23063000000031042
374	101	10	Python Syntax and Semantics	<div>In this lesson, we will delve into the fundamental concepts of Python syntax and semantics, which are essential for any aspiring Python developer. Understanding these concepts is crucial as they form the foundation upon which you will build your programming skills. Let's break down these concepts into manageable sections.<br></div><div><br></div><div>### 1. Introduction to Syntax<br></div><div>Python syntax refers to the set of rules that define the combinations of symbols that are considered to be correctly structured programs in the Python language. Syntax governs how we write Python code, including how we structure statements, define variables, and use functions.<br></div><div><br></div><div>- **Basic Structure**: Every Python program is made up of statements that are executed in a specific order. The basic structure includes:<br></div><div>  - **Variables**: Used to store data values. For example, `x = 5` assigns the integer 5 to the variable `x`.<br></div><div>  - **Data Types**: Python supports various data types, including integers, floats, strings, and booleans.<br></div><div>  - **Indentation**: Python uses indentation to define the scope of loops, functions, and conditionals. This is a unique feature of Python that distinguishes it from many other programming languages.<br></div><div><br></div><div>### 2. Key Syntax Elements<br></div><div>Let's explore some key elements of Python syntax:<br></div><div><br></div><div>- **Comments**: Use the `#` symbol to write comments in your code, which are ignored by the interpreter. Example: `# This is a comment`<br></div><div>- **Operators**: Python includes various operators for arithmetic, comparison, and logical operations. For instance, `+`, `-`, `*`, and `/` are arithmetic operators.<br></div><div>- **Control Structures**: These include `if`, `for`, and `while` statements, which allow you to control the flow of your program based on conditions.<br></div><div><br></div><div>### 3. Understanding Semantics<br></div><div>While syntax focuses on the structure of the code, semantics refers to the meaning behind the code. It deals with what the code does when it is executed. Understanding semantics is crucial for writing effective and efficient code.<br></div><div><br></div><div>- **Execution Flow**: The semantics of Python dictate how the code is executed. For example, in a conditional statement, the code block under the `if` statement will only execute if the condition evaluates to `True`.<br></div><div>- **Function Behavior**: When you define a function, the semantics define what happens when the function is called. For instance, `def add(a, b): return a + b` means that when you call `add(2, 3)`, it will return `5`.<br></div><div><br></div><div>### 4. Common Syntax Errors<br></div><div>As you begin coding in Python, you may encounter syntax errors. These occur when the code does not conform to the rules of the language. Common syntax errors include:<br></div><div>- **Indentation Errors**: Occur when the indentation levels are inconsistent.<br></div><div>- **Syntax Errors**: Occur when there is a typo or incorrect use of Python syntax, such as missing colons or parentheses.<br></div><div><br></div><div>### 5. Best Practices<br></div><div>To write clean and effective Python code, consider the following best practices:<br></div><div>- **Consistent Indentation**: Always use the same number of spaces (usually 4) for indentation.<br></div><div>- **Meaningful Variable Names**: Use descriptive names for variables and functions to enhance code readability.<br></div><div>- **Comment Your Code**: Write comments to explain complex logic or important sections of your code.<br></div><div><br></div><div>### Conclusion<br></div><div>In summary, mastering Python syntax and semantics is a critical step in your journey as a Python developer. By understanding the rules of the language and the meaning behind your code, you will be better equipped to write efficient, readable, and maintainable programs. In the next lesson, we will explore data types and variables in greater detail, allowing you to apply your understanding of syntax and semantics to practical programming tasks.</div>	\N	\N	2	f	2026-02-20 16:27:35.324478	\N
375	101	10	Data Types and Variables	<div><h1>Understanding Data Types and Variables in Python</h1><br></div><div><br></div><div><p>In the world of programming, data types and variables are foundational concepts that every programmer must grasp. This lesson will delve into the essence of data types, the significance of variables, and how they interact within the Python programming language.</p><br></div><div><br></div><div><h2>What are Data Types?</h2><br></div><div><p>Data types are classifications that dictate what kind of data can be stored and manipulated within a program. Python, being a dynamically typed language, automatically determines the type of a variable at runtime. Here are the primary data types in Python:</p><br></div><div><br></div><div><ul><br></div><div>  <li><strong>Integers (int):</strong> Whole numbers, both positive and negative, without decimals. Example: 5, -3, 42.</li><br></div><div>  <li><strong>Floating Point Numbers (float):</strong> Numbers that contain a decimal point. Example: 3.14, -0.001, 2.0.</li><br></div><div>  <li><strong>Strings (str):</strong> Sequences of characters enclosed in single or double quotes. Example: 'Hello, World!', "Python".</li><br></div><div>  <li><strong>Booleans (bool):</strong> Represents one of two values: True or False. Useful for conditional statements.</li><br></div><div>  <li><strong>Lists:</strong> Ordered collections of items, which can be of mixed data types. Example: [1, 2.5, 'Python', True].</li><br></div><div>  <li><strong>Dictionaries:</strong> Unordered collections of key-value pairs. Example: {'name': 'Alice', 'age': 30}.</li><br></div><div>  <li><strong>Tuples:</strong> Immutable ordered collections. Example: (1, 2, 3).</li><br></div><div>  <li><strong>Sets:</strong> Unordered collections of unique items. Example: {1, 2, 3}.</li><br></div><div></ul><br></div><div><br></div><div><h2>What are Variables?</h2><br></div><div><p>Variables are symbolic names that represent data values. They act as containers for storing data that can be referenced and manipulated throughout your program. In Python, variables are created by simply assigning a value to a name using the assignment operator (=).</p><br></div><div><br></div><div><h3>Variable Naming Rules</h3><br></div><div><p>When creating variables, it's important to follow certain naming conventions:</p><br></div><div><ul><br></div><div>  <li>Variable names must start with a letter (a-z, A-Z) or an underscore (_).</li><br></div><div>  <li>Subsequent characters can be letters, numbers (0-9), or underscores.</li><br></div><div>  <li>Variable names are case-sensitive (e.g., <code>myVar</code> and <code>myvar</code> are different).</li><br></div><div>  <li>Avoid using reserved keywords (e.g., <code>if</code>, <code>else</code>, <code>for</code>, etc.).</li><br></div><div></ul><br></div><div><br></div><div><h3>Assigning Values to Variables</h3><br></div><div><p>To assign a value to a variable, use the following syntax:</p><br></div><div><pre><code>variable_name = value</code></pre><br></div><div><p>For example:</p><br></div><div><pre><code>age = 25<br></div><div>name = 'John'<br></div><div>height = 5.9<br></div><div>is_student = True</code></pre><br></div><div><br></div><div><h2>Type Checking and Conversion</h2><br></div><div><p>In Python, you can check the type of a variable using the <code>type()</code> function:</p><br></div><div><pre><code>print(type(age))  # Output: <class 'int'></code></pre><br></div><div><p>If you need to convert between data types, Python provides built-in functions such as <code>int()</code>, <code>float()</code>, and <code>str()</code>:</p><br></div><div><pre><code>num_str = '10'<br></div><div>num_int = int(num_str)  # Converts string to integer</code></pre><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Data types and variables are crucial to understanding how to store and manipulate data in Python. Mastering these concepts will empower you to write more efficient and effective code. In the next lesson, we will explore control structures that allow you to manage the flow of your programs.</p></div>	\N	\N	3	f	2026-02-20 16:27:35.328325	\N
376	101	10	Control Structures	<div>In this lesson, we will delve into the essential concept of control structures in Python, which serve as the foundation for making decisions, repeating actions, and managing the flow of programs. Control structures allow programmers to dictate the order in which statements are executed, enabling the creation of dynamic and responsive applications.<br></div><div><br></div><div>### 1. Introduction to Control Structures<br></div><div>Control structures are constructs that dictate the flow of control in a program. They can be broadly categorized into three types:<br></div><div>- **Sequential Structures**: The default mode of execution where statements are executed one after another.<br></div><div>- **Selection Structures**: Allow the program to choose different paths based on conditions (e.g., `if`, `elif`, `else`).<br></div><div>- **Repetition Structures**: Enable the execution of a block of code multiple times (e.g., `for` loops, `while` loops).<br></div><div><br></div><div>### 2. Selection Structures<br></div><div>Selection structures are crucial for decision-making in code. Let's explore the key components:<br></div><div><br></div><div>#### 2.1 The `if` Statement<br></div><div>The `if` statement evaluates a condition and executes a block of code if the condition is true.<br></div><div>```python<br></div><div>age = 18<br></div><div>if age >= 18:<br></div><div>    print('You are eligible to vote.')<br></div><div>```<br></div><div>In this example, the message is printed only if the `age` variable is 18 or older.<br></div><div><br></div><div>#### 2.2 The `elif` and `else` Statements<br></div><div>To handle multiple conditions, we use `elif` (else if) and `else` statements. This allows for more complex decision-making.<br></div><div>```python<br></div><div>score = 85<br></div><div>if score >= 90:<br></div><div>    print('Grade: A')<br></div><div>elif score >= 80:<br></div><div>    print('Grade: B')<br></div><div>else:<br></div><div>    print('Grade: C')<br></div><div>```<br></div><div>Here, the program checks the score and prints the corresponding grade based on the defined conditions.<br></div><div><br></div><div>### 3. Repetition Structures<br></div><div>Repetition structures allow us to execute a block of code multiple times, which is essential for tasks like iterating over data.<br></div><div><br></div><div>#### 3.1 The `for` Loop<br></div><div>The `for` loop is used to iterate over a sequence (like a list, tuple, or string).<br></div><div>```python<br></div><div>fruits = ['apple', 'banana', 'cherry']<br></div><div>for fruit in fruits:<br></div><div>    print(fruit)<br></div><div>```<br></div><div>In this example, each fruit in the list is printed one by one.<br></div><div><br></div><div>#### 3.2 The `while` Loop<br></div><div>The `while` loop continues to execute as long as a specified condition is true.<br></div><div>```python<br></div><div>count = 0<br></div><div>while count < 5:<br></div><div>    print(count)<br></div><div>    count += 1<br></div><div>```<br></div><div>This loop will print numbers from 0 to 4, demonstrating how conditions can control the flow of execution.<br></div><div><br></div><div>### 4. Nested Control Structures<br></div><div>Control structures can also be nested within each other, allowing for more complex logic. For instance, you can have an `if` statement inside a loop:<br></div><div>```python<br></div><div>for number in range(10):<br></div><div>    if number % 2 == 0:<br></div><div>        print(f'{number} is even')<br></div><div>    else:<br></div><div>        print(f'{number} is odd')<br></div><div>```<br></div><div>This code checks each number from 0 to 9 and prints whether it is even or odd.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>Understanding control structures is vital for any Python programmer. They allow you to build programs that can respond to different inputs and conditions, making your applications more versatile and powerful. In the upcoming lessons, we will apply these concepts in real-world projects, enhancing your skills and preparing you for practical programming challenges. <br></div><div><br></div><div>### 6. Practice Exercises<br></div><div>To solidify your understanding, try the following exercises:<br></div><div>1. Write a program that checks if a number is positive, negative, or zero using control structures.<br></div><div>2. Create a multiplication table using a nested loop.<br></div><div>3. Develop a simple quiz application that evaluates user input and provides feedback based on their answers.<br></div><div><br></div><div>By mastering control structures, you will be well on your way to becoming a proficient Python developer, ready to tackle more advanced topics and projects.</div>	\N	\N	4	f	2026-02-20 16:27:35.33148	\N
377	102	10	Functions and Modules	<div>In this lesson, we will delve into two fundamental concepts in Python programming: Functions and Modules. Understanding these concepts is crucial for writing clean, efficient, and reusable code. Let's explore each of these topics in detail.<br></div><div><br></div><div>### 1. Functions in Python<br></div><div>Functions are reusable blocks of code that perform a specific task. They help in organizing code, making it more readable, and reducing redundancy. Here are some key aspects of functions:<br></div><div><br></div><div>#### 1.1 Defining a Function<br></div><div>To define a function in Python, we use the `def` keyword followed by the function name and parentheses. Here’s a simple example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    return f'Hello, {name}!'<br></div><div>```<br></div><div>This function, `greet`, takes one parameter, `name`, and returns a greeting message.<br></div><div><br></div><div>#### 1.2 Calling a Function<br></div><div>Once a function is defined, you can call it by using its name followed by parentheses:<br></div><div>```python<br></div><div>print(greet('Alice'))  # Output: Hello, Alice!<br></div><div>```<br></div><div><br></div><div>#### 1.3 Function Parameters and Arguments<br></div><div>Functions can accept parameters, allowing you to pass values into them. There are several types of parameters:<br></div><div>- **Positional Parameters**: These are parameters that must be provided in a specific order.<br></div><div>- **Keyword Parameters**: These allow you to specify parameters by name, making your code more readable.<br></div><div>- **Default Parameters**: You can set default values for parameters, making them optional.<br></div><div><br></div><div>Example:<br></div><div>```python<br></div><div>def greet(name, greeting='Hello'):<br></div><div>    return f'{greeting}, {name}!'<br></div><div>```<br></div><div><br></div><div>#### 1.4 Return Statement<br></div><div>The `return` statement is used to exit a function and send a value back to the caller. If no return statement is specified, the function returns `None` by default.<br></div><div><br></div><div>### 2. Scope of Variables<br></div><div>Understanding variable scope is essential when working with functions. Variables defined inside a function are local to that function and cannot be accessed outside of it. Conversely, variables defined outside functions are global and can be accessed anywhere in the code.<br></div><div><br></div><div>### 3. Modules in Python<br></div><div>Modules are files containing Python code that can define functions, classes, and variables. They allow you to organize your code into manageable sections and promote code reuse.<br></div><div><br></div><div>#### 3.1 Creating a Module<br></div><div>To create a module, simply save your Python code in a file with a `.py` extension. For example, if you create a file named `math_operations.py` with the following content:<br></div><div>```python<br></div><div>def add(a, b):<br></div><div>    return a + b<br></div><div><br></div><div>def subtract(a, b):<br></div><div>    return a - b<br></div><div>```<br></div><div><br></div><div>#### 3.2 Importing a Module<br></div><div>You can import a module into another Python file using the `import` statement. For example:<br></div><div>```python<br></div><div>import math_operations<br></div><div><br></div><div>result = math_operations.add(5, 3)<br></div><div>print(result)  # Output: 8<br></div><div>```<br></div><div><br></div><div>#### 3.3 Using `from` to Import Specific Functions<br></div><div>You can also import specific functions from a module using the `from` keyword:<br></div><div>```python<br></div><div>from math_operations import subtract<br></div><div><br></div><div>result = subtract(10, 4)<br></div><div>print(result)  # Output: 6<br></div><div>```<br></div><div><br></div><div>### 4. Benefits of Using Functions and Modules<br></div><div>- **Code Reusability**: Functions and modules allow you to reuse code, saving time and reducing errors.<br></div><div>- **Improved Readability**: Breaking down code into functions and modules makes it easier to read and understand.<br></div><div>- **Easier Maintenance**: When you need to make changes, you can do so in one place rather than throughout your codebase.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>In this lesson, we covered the essential aspects of functions and modules in Python. Mastering these concepts will significantly enhance your programming skills and prepare you for more complex projects. In the next lesson, we will explore error handling and debugging techniques, which are vital for developing robust applications.</div>	\N	\N	1	t	2026-02-20 16:27:35.338443	\N
378	102	10	Object-Oriented Programming	<div><h1>Understanding Object-Oriented Programming (OOP)</h1><br></div><div><p>Object-Oriented Programming (OOP) is a programming paradigm that uses 'objects' to represent data and methods to manipulate that data. It is a foundational concept in Python and many other programming languages, allowing for code reusability, scalability, and ease of maintenance.</p><br></div><div><br></div><div><h2>Key Concepts of OOP</h2><br></div><div><ul><br></div><div>  <li><strong>Classes:</strong> A class is a blueprint for creating objects. It defines a set of attributes and methods that the created objects will have. For example, a class <code>Car</code> might have attributes like <code>color</code> and <code>model</code>, and methods like <code>drive()</code> and <code>stop()</code>.</li><br></div><div>  <li><strong>Objects:</strong> An object is an instance of a class. Using the <code>Car</code> class, you can create objects like <code>my_car = Car('red', 'Toyota')</code>. Each object can have different attribute values while sharing the same methods.</li><br></div><div>  <li><strong>Encapsulation:</strong> This principle restricts direct access to some of an object's components, which can prevent the accidental modification of data. In Python, you can use private and public attributes to enforce encapsulation.</li><br></div><div>  <li><strong>Inheritance:</strong> Inheritance allows a new class to inherit the properties and methods of an existing class. This promotes code reusability. For instance, you can create a class <code>ElectricCar</code> that inherits from <code>Car</code> and adds additional features like <code>charge()</code>.</li><br></div><div>  <li><strong>Polymorphism:</strong> Polymorphism allows methods to do different things based on the object it is acting upon. This means that a method can be defined in a base class and overridden in a derived class, enabling different behaviors.</li><br></div><div></ul><br></div><div><br></div><div><h2>Why Use OOP in Python?</h2><br></div><div><p>OOP provides several advantages that can enhance your programming experience and the quality of your code:</p><br></div><div><ul><br></div><div>  <li><strong>Modularity:</strong> Code can be organized into classes and modules, making it easier to manage and understand.</li><br></div><div>  <li><strong>Reusability:</strong> Classes can be reused across different projects, reducing redundancy and saving time.</li><br></div><div>  <li><strong>Maintainability:</strong> Changes to a class can be made in one place, and those changes will propagate to all instances of the class.</li><br></div><div>  <li><strong>Collaboration:</strong> OOP makes it easier for teams to work on different parts of a project simultaneously, as each team can focus on different classes.</li><br></div><div></ul><br></div><div><br></div><div><h2>Implementing OOP in Python</h2><br></div><div><p>Here’s a simple example to illustrate how to implement OOP in Python:</p><br></div><div><pre><code>class Car:<br></div><div>    def __init__(self, color, model):<br></div><div>        self.color = color<br></div><div>        self.model = model<br></div><div><br></div><div>    def drive(self):<br></div><div>        print(f'The {self.color} {self.model} is driving.')<br></div><div><br></div><div>class ElectricCar(Car):<br></div><div>    def charge(self):<br></div><div>        print(f'The {self.color} {self.model} is charging.')<br></div><div><br></div><div># Creating objects<br></div><div>my_car = Car('red', 'Toyota')<br></div><div>my_car.drive()<br></div><div><br></div><div>my_electric_car = ElectricCar('blue', 'Tesla')<br></div><div>my_electric_car.drive()<br></div><div>my_electric_car.charge()</code></pre><br></div><div><p>In this example, we define a base class <code>Car</code> and a derived class <code>ElectricCar</code>. The derived class inherits the properties and methods of the base class while adding its own functionality.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Object-Oriented Programming is an essential skill for any Python developer. Understanding its principles will not only improve your coding abilities but also prepare you for real-world programming tasks. By mastering OOP, you can create more efficient, scalable, and maintainable code. As you progress in this course, you will apply these concepts in real-world projects, solidifying your understanding and enhancing your programming toolkit.</p></div>	\N	\N	2	f	2026-02-20 16:27:35.343203	\N
379	102	10	Error Handling and Exceptions	<div>In the world of programming, errors are inevitable. Whether they arise from user input, system failures, or logical mistakes, handling these errors gracefully is crucial for creating robust and user-friendly applications. This lesson focuses on 'Error Handling and Exceptions' in Python, an essential skill for any aspiring Python developer. <br></div><div><br></div><div>### Understanding Errors and Exceptions<br></div><div><br></div><div>Errors in Python can be broadly categorized into two types: syntax errors and exceptions. <br></div><div><br></div><div>1. **Syntax Errors**: These occur when the code does not conform to the syntax rules of the Python language. For example, forgetting a colon at the end of a function definition will raise a syntax error. <br></div><div>   <br></div><div>   ```python<br></div><div>   def my_function()<br></div><div>       print("Hello, World!")  # This will raise a SyntaxError<br></div><div>   ```<br></div><div><br></div><div>2. **Exceptions**: Unlike syntax errors, exceptions are raised during the execution of a program when the interpreter encounters a situation it cannot handle. Common exceptions include `ValueError`, `TypeError`, `IndexError`, and `ZeroDivisionError`. <br></div><div><br></div><div>### The Try-Except Block<br></div><div><br></div><div>To handle exceptions in Python, we use the `try` and `except` blocks. The code that may raise an exception is placed inside the `try` block, and the code that handles the exception is placed inside the `except` block. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    result = 10 / 0  # This will raise a ZeroDivisionError<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>In this example, when the division by zero occurs, the program does not crash; instead, it gracefully handles the error and prints a user-friendly message. <br></div><div><br></div><div>### Catching Multiple Exceptions<br></div><div><br></div><div>Sometimes, you may want to handle multiple exceptions that could arise from a block of code. You can do this by specifying multiple `except` clauses. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>### The Else and Finally Clauses<br></div><div><br></div><div>In addition to `try` and `except`, Python provides `else` and `finally` clauses to enhance error handling. The `else` block runs if the `try` block does not raise an exception, while the `finally` block always runs, regardless of whether an exception occurred. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>else:<br></div><div>    print(f"The result is {result}")<br></div><div>finally:<br></div><div>    print("Execution completed.")<br></div><div>```  <br></div><div><br></div><div>### Raising Exceptions<br></div><div><br></div><div>You can also raise exceptions intentionally using the `raise` statement. This is useful when you want to enforce certain conditions in your code. <br></div><div><br></div><div>```python<br></div><div>def check_positive(number):<br></div><div>    if number < 0:<br></div><div>        raise ValueError("Number must be positive!")<br></div><div>    return number<br></div><div>```  <br></div><div><br></div><div>### Custom Exception Classes<br></div><div><br></div><div>For more complex applications, you may want to define your own custom exceptions. This allows for more specific error handling tailored to your application's needs. <br></div><div><br></div><div>```python<br></div><div>class CustomError(Exception):<br></div><div>    pass<br></div><div><br></div><div>try:<br></div><div>    raise CustomError("This is a custom error message.")<br></div><div>except CustomError as e:<br></div><div>    print(e)<br></div><div>```  <br></div><div><br></div><div>### Conclusion<br></div><div><br></div><div>Error handling is a vital skill in Python programming. By mastering `try`, `except`, `else`, and `finally`, as well as understanding how to raise and define custom exceptions, you can create applications that are not only functional but also robust and user-friendly. This lesson lays the groundwork for effective error management, which will be crucial as you build real-world projects in this course.</div>	\N	\N	3	f	2026-02-20 16:27:35.346261	\N
380	102	10	Working with Libraries	<div>In this lesson, we will delve into the concept of libraries in Python, a fundamental aspect of programming that enhances productivity and code reusability. Libraries are collections of pre-written code that provide specific functionalities, allowing developers to leverage existing solutions instead of writing code from scratch. This lesson will cover the following key areas:<br></div><div><br></div><div>### 1. Understanding Libraries<br></div><div>Libraries in Python can be thought of as toolkits that provide a set of functions and methods to perform various tasks. They can be categorized into:<br></div><div>- **Standard Libraries**: These are included with Python and provide a wide range of functionalities, such as file I/O, system calls, and data manipulation.<br></div><div>- **Third-Party Libraries**: These are external packages created by the community or organizations that can be installed and used to extend Python's capabilities.<br></div><div><br></div><div>### 2. Why Use Libraries?<br></div><div>Using libraries offers several advantages:<br></div><div>- **Efficiency**: Libraries save time by providing ready-to-use code, allowing developers to focus on the unique aspects of their projects.<br></div><div>- **Reliability**: Well-maintained libraries are tested and widely used, reducing the likelihood of bugs in your code.<br></div><div>- **Community Support**: Many libraries have large communities that contribute to their development and provide support through documentation and forums.<br></div><div><br></div><div>### 3. How to Import Libraries<br></div><div>To use a library in your Python code, you need to import it. The basic syntax for importing a library is:<br></div><div>```python<br></div><div>import library_name<br></div><div>```<br></div><div>For example, to import the `math` library, you would write:<br></div><div>```python<br></div><div>import math<br></div><div>```<br></div><div>You can also import specific functions from a library:<br></div><div>```python<br></div><div>from library_name import function_name<br></div><div>```<br></div><div>This allows you to use the function directly without prefixing it with the library name.<br></div><div><br></div><div>### 4. Popular Python Libraries<br></div><div>Here are some widely-used libraries that you will encounter in your Python journey:<br></div><div>- **NumPy**: A library for numerical computations, particularly useful for handling arrays and matrices.<br></div><div>- **Pandas**: A data manipulation library that provides data structures like DataFrames for handling structured data.<br></div><div>- **Matplotlib**: A plotting library that allows you to create static, animated, and interactive visualizations in Python.<br></div><div>- **Requests**: A library for making HTTP requests, simplifying the process of working with APIs.<br></div><div><br></div><div>### 5. Installing Third-Party Libraries<br></div><div>To install third-party libraries, you can use `pip`, Python's package installer. The command to install a library is:<br></div><div>```bash<br></div><div>pip install library_name<br></div><div>```<br></div><div>For example, to install the Requests library, you would run:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div>Make sure to have a virtual environment set up to manage dependencies effectively.<br></div><div><br></div><div>### 6. Best Practices for Using Libraries<br></div><div>When working with libraries, consider the following best practices:<br></div><div>- **Read Documentation**: Familiarize yourself with the library's documentation to understand its features and usage.<br></div><div>- **Keep Libraries Updated**: Regularly update libraries to benefit from new features, improvements, and security patches.<br></div><div>- **Limit Dependencies**: Use only the libraries you need to keep your project lightweight and manageable.<br></div><div><br></div><div>### 7. Real-World Application<br></div><div>In the context of our course, you will apply your knowledge of libraries in the five real-world projects. For instance, when working on a data analysis project, you might use Pandas for data manipulation and Matplotlib for visualization. By leveraging libraries, you will be able to create robust and efficient solutions while enhancing your coding skills.<br></div><div><br></div><div>### Conclusion<br></div><div>Understanding and effectively using libraries is crucial for any Python developer. They not only streamline the coding process but also allow you to harness the collective knowledge of the programming community. As we progress through this course, you will gain hands-on experience with various libraries, enabling you to build sophisticated applications with ease.</div>	\N	\N	4	f	2026-02-20 16:27:35.349991	\N
381	103	10	Introduction to Pandas	<div>### Introduction to Pandas<br></div><div><br></div><div>Pandas is a powerful and versatile open-source data analysis and manipulation library for Python. It provides data structures and functions needed to work with structured data seamlessly. This lesson will introduce you to the core concepts of Pandas, its key features, and how to get started with data analysis using this library.<br></div><div><br></div><div>#### What is Pandas?<br></div><div>Pandas is built on top of NumPy and is designed for data manipulation and analysis. It offers two primary data structures:<br></div><div>- **Series**: A one-dimensional labeled array capable of holding any data type.<br></div><div>- **DataFrame**: A two-dimensional labeled data structure with columns of potentially different types. It is similar to a spreadsheet or SQL table.<br></div><div><br></div><div>#### Key Features of Pandas<br></div><div>1. **Data Alignment**: Pandas automatically aligns data based on labels, making it easy to work with data from different sources.<br></div><div>2. **Handling Missing Data**: Pandas provides robust tools for detecting, removing, and filling missing data, ensuring data integrity.<br></div><div>3. **Data Transformation**: With built-in functions, you can easily reshape, merge, and concatenate datasets.<br></div><div>4. **Time Series Analysis**: Pandas has extensive support for time series data, allowing for easy manipulation and analysis of date and time data.<br></div><div>5. **Data Visualization**: While Pandas itself is not a visualization library, it integrates well with libraries like Matplotlib and Seaborn, enabling effective data visualization.<br></div><div><br></div><div>#### Getting Started with Pandas<br></div><div>To begin using Pandas, you first need to install it. You can do this via pip:<br></div><div>```bash<br></div><div>pip install pandas<br></div><div>```<br></div><div><br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import pandas as pd<br></div><div>```<br></div><div><br></div><div>#### Creating a Series<br></div><div>A Series can be created from a list, dictionary, or NumPy array. Here’s how to create a simple Series:<br></div><div>```python<br></div><div># Creating a Series from a list<br></div><div>data = [10, 20, 30, 40]<br></div><div>series = pd.Series(data)<br></div><div>print(series)<br></div><div>```<br></div><div><br></div><div>#### Creating a DataFrame<br></div><div>A DataFrame can be created from various data sources, including dictionaries, lists, or external files like CSV. Here’s an example of creating a DataFrame from a dictionary:<br></div><div>```python<br></div><div># Creating a DataFrame from a dictionary<br></div><div>data = {<br></div><div>    'Name': ['Alice', 'Bob', 'Charlie'],<br></div><div>    'Age': [24, 30, 22],<br></div><div>    'City': ['New York', 'Los Angeles', 'Chicago']<br></div><div>}<br></div><div>df = pd.DataFrame(data)<br></div><div>print(df)<br></div><div>```<br></div><div><br></div><div>#### Basic DataFrame Operations<br></div><div>1. **Viewing Data**: Use `df.head()` to view the first few rows of the DataFrame.<br></div><div>2. **Descriptive Statistics**: Use `df.describe()` to get a summary of statistics for numerical columns.<br></div><div>3. **Indexing and Selecting Data**: Access rows and columns using `loc` and `iloc` methods.<br></div><div>4. **Filtering Data**: Use boolean indexing to filter data based on conditions.<br></div><div><br></div><div>#### Conclusion<br></div><div>Pandas is an essential tool for anyone working with data in Python. Its intuitive data structures and powerful functionalities make data manipulation straightforward and efficient. In the upcoming lessons, we will dive deeper into advanced features of Pandas, including data cleaning, merging datasets, and performing complex analyses. Get ready to harness the full power of data with Pandas!</div>	\N	\N	1	t	2026-02-20 16:27:35.357365	\N
382	103	10	Data Cleaning Techniques	<div>Data cleaning is a critical step in the data analysis process that ensures the accuracy and quality of your datasets. In this lesson, we will explore various data cleaning techniques that every data professional should master, particularly when working with Python. <br></div><div><br></div><div>### 1. Understanding Data Cleaning<br></div><div>Data cleaning, also known as data cleansing or data scrubbing, involves identifying and correcting errors or inconsistencies in data to improve its quality. This process can include handling missing values, removing duplicates, correcting data types, and addressing outliers. <br></div><div><br></div><div>### 2. Importance of Data Cleaning<br></div><div>- **Accuracy**: Clean data leads to more accurate analysis and insights. <br></div><div>- **Efficiency**: Well-prepared data reduces the time spent on analysis. <br></div><div>- **Decision Making**: High-quality data supports better decision-making in business contexts. <br></div><div><br></div><div>### 3. Common Data Cleaning Techniques<br></div><div>#### a. Handling Missing Values<br></div><div>   - **Removal**: Delete rows or columns with missing values if they are not significant. <br></div><div>   - **Imputation**: Replace missing values with statistical measures like mean, median, or mode. <br></div><div>   - **Interpolation**: Use methods like linear interpolation to estimate missing values based on surrounding data. <br></div><div><br></div><div>#### b. Removing Duplicates<br></div><div>   - Use the `drop_duplicates()` function in pandas to eliminate duplicate entries in your dataset. <br></div><div>   - Ensure that you identify which columns define a duplicate entry. <br></div><div><br></div><div>#### c. Correcting Data Types<br></div><div>   - Ensure that each column in your dataset has the correct data type (e.g., integers, floats, strings). <br></div><div>   - Use the `astype()` method in pandas to convert data types as necessary. <br></div><div><br></div><div>#### d. Outlier Detection and Treatment<br></div><div>   - Identify outliers using statistical methods (e.g., Z-score, IQR). <br></div><div>   - Decide whether to remove, transform, or keep outliers based on their impact on your analysis. <br></div><div><br></div><div>#### e. Standardizing Data<br></div><div>   - Ensure consistency in data formats (e.g., date formats, text casing). <br></div><div>   - Use string methods and regular expressions to clean and standardize text data. <br></div><div><br></div><div>### 4. Tools and Libraries for Data Cleaning in Python<br></div><div>- **Pandas**: The primary library for data manipulation and cleaning. <br></div><div>- **NumPy**: Useful for numerical operations and handling arrays. <br></div><div>- **OpenRefine**: A powerful tool for working with messy data and exploring large datasets. <br></div><div><br></div><div>### 5. Best Practices for Data Cleaning<br></div><div>- **Document Your Process**: Keep track of the cleaning steps you take for reproducibility. <br></div><div>- **Automate When Possible**: Use scripts to automate repetitive cleaning tasks. <br></div><div>- **Validate Your Data**: Always check the results of your cleaning process to ensure data integrity. <br></div><div><br></div><div>### 6. Conclusion<br></div><div>Mastering data cleaning techniques is essential for any data professional. By applying these techniques effectively, you can ensure that your datasets are reliable, which will ultimately lead to more accurate analyses and better-informed decisions. In the next lesson, we will dive into practical applications of these techniques through real-world projects.</div>	\N	\N	2	f	2026-02-20 16:27:35.361214	\N
383	103	10	Data Visualization with Matplotlib	<div>### Introduction to Data Visualization<br></div><div>Data visualization is a crucial aspect of data analysis that allows us to present data in a visual context, making it easier to identify patterns, trends, and insights. In this lesson, we will explore Matplotlib, a powerful Python library for creating static, animated, and interactive visualizations in Python.<br></div><div><br></div><div>### What is Matplotlib?<br></div><div>Matplotlib is one of the most widely used libraries for data visualization in Python. It provides a flexible and comprehensive framework for creating a variety of plots and charts. With Matplotlib, you can create line plots, scatter plots, bar charts, histograms, and much more.<br></div><div><br></div><div>### Getting Started with Matplotlib<br></div><div>To begin using Matplotlib, you first need to install it. You can do this using pip:<br></div><div>```bash<br></div><div>pip install matplotlib<br></div><div>```<br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>```<br></div><div><br></div><div>### Basic Plotting with Matplotlib<br></div><div>#### Line Plots<br></div><div>Line plots are one of the simplest forms of data visualization. They are ideal for showing trends over time. Here’s how to create a basic line plot:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>import numpy as np<br></div><div><br></div><div># Sample data<br></div><div>x = np.linspace(0, 10, 100)<br></div><div>y = np.sin(x)<br></div><div><br></div><div># Create a line plot<br></div><div>plt.plot(x, y)<br></div><div>plt.title('Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a sine wave, illustrating how to label axes and add a title.<br></div><div><br></div><div>#### Scatter Plots<br></div><div>Scatter plots are useful for showing the relationship between two variables. Here’s an example:<br></div><div>```python<br></div><div># Sample data<br></div><div>x = np.random.rand(50)<br></div><div>y = np.random.rand(50)<br></div><div><br></div><div># Create a scatter plot<br></div><div>plt.scatter(x, y, color='blue', alpha=0.5)<br></div><div>plt.title('Random Scatter Plot')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a scatter plot with random data points.<br></div><div><br></div><div>### Customizing Plots<br></div><div>Matplotlib allows extensive customization of your plots. You can change colors, line styles, markers, and much more. Here’s how to customize a line plot:<br></div><div>```python<br></div><div># Customizing a line plot<br></div><div>plt.plot(x, y, color='red', linestyle='--', linewidth=2, marker='o')<br></div><div>plt.title('Customized Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>### Subplots<br></div><div>You can create multiple plots in a single figure using subplots. This is useful for comparing different datasets:<br></div><div>```python<br></div><div>fig, axs = plt.subplots(2, 1)<br></div><div><br></div><div># First subplot<br></div><div>axs[0].plot(x, y, color='blue')<br></div><div>axs[0].set_title('Sine Wave')<br></div><div><br></div><div># Second subplot<br></div><div>axs[1].scatter(x, y, color='green')<br></div><div>axs[1].set_title('Random Scatter')<br></div><div><br></div><div>plt.tight_layout()<br></div><div>plt.show()<br></div><div>```<br></div><div>### Conclusion<br></div><div>In this lesson, we have covered the basics of data visualization using Matplotlib. You learned how to create line plots, scatter plots, customize visualizations, and use subplots. Mastering these skills will enable you to effectively communicate your data insights through compelling visual representations. In the next lesson, we will explore advanced visualization techniques and how to integrate Matplotlib with other libraries such as Pandas and Seaborn for enhanced data analysis.</div>	\N	\N	3	f	2026-02-20 16:27:35.3667	\N
384	103	10	Exploratory Data Analysis	<div>## Introduction to Exploratory Data Analysis (EDA)<br></div><div><br></div><div>Exploratory Data Analysis (EDA) is a critical step in the data analysis process, serving as a foundation for understanding the underlying patterns and structures within a dataset. It involves summarizing the main characteristics of the data, often using visual methods. EDA allows data scientists to formulate hypotheses, identify anomalies, and gain insights that inform further analysis or modeling.<br></div><div><br></div><div>## Objectives of EDA<br></div><div><br></div><div>1. **Understanding Data Distribution**: EDA helps in understanding how data is distributed, identifying skewness, kurtosis, and the presence of outliers.<br></div><div>2. **Identifying Relationships**: It aids in discovering relationships between variables, which can be crucial for predictive modeling.<br></div><div>3. **Detecting Anomalies**: EDA can reveal anomalies or outliers that may need to be addressed before further analysis.<br></div><div>4. **Formulating Hypotheses**: By visualizing data, analysts can generate hypotheses that can be tested with statistical methods.<br></div><div><br></div><div>## Key Techniques in EDA<br></div><div><br></div><div>### 1. Descriptive Statistics<br></div><div>Descriptive statistics provide a summary of the central tendency, dispersion, and shape of a dataset’s distribution. Key metrics include:<br></div><div>- **Mean**: Average value of the dataset.<br></div><div>- **Median**: The middle value when the data is sorted.<br></div><div>- **Mode**: The most frequently occurring value.<br></div><div>- **Standard Deviation**: Measures the amount of variation or dispersion in a set of values.<br></div><div><br></div><div>### 2. Data Visualization<br></div><div>Visualizing data is one of the most powerful tools in EDA. Common visualization techniques include:<br></div><div>- **Histograms**: Useful for understanding the distribution of a single variable.<br></div><div>- **Box Plots**: Effective for identifying outliers and understanding the spread of the data.<br></div><div>- **Scatter Plots**: Helpful for examining relationships between two continuous variables.<br></div><div>- **Heatmaps**: Useful for visualizing correlation matrices.<br></div><div><br></div><div>### 3. Correlation Analysis<br></div><div>Correlation analysis helps in identifying relationships between variables. The correlation coefficient (e.g., Pearson's r) quantifies the degree to which two variables are related. A heatmap can be a great visual tool to represent these correlations.<br></div><div><br></div><div>### 4. Handling Missing Values<br></div><div>Missing data can skew results and lead to incorrect conclusions. EDA should include strategies for handling missing values, such as:<br></div><div>- **Imputation**: Filling in missing values with the mean, median, or mode.<br></div><div>- **Deletion**: Removing records with missing values, if appropriate.<br></div><div><br></div><div>### 5. Outlier Detection<br></div><div>Outliers can significantly affect the results of data analysis. Techniques for detecting outliers include:<br></div><div>- **Z-Score Method**: Identifying data points that lie beyond a certain number of standard deviations from the mean.<br></div><div>- **IQR Method**: Using the interquartile range to identify outliers.<br></div><div><br></div><div>## Tools and Libraries for EDA in Python<br></div><div>Python offers a variety of libraries that facilitate EDA, including:<br></div><div>- **Pandas**: For data manipulation and analysis.<br></div><div>- **Matplotlib**: For creating static, interactive, and animated visualizations.<br></div><div>- **Seaborn**: Built on Matplotlib, it provides a high-level interface for drawing attractive statistical graphics.<br></div><div>- **NumPy**: For numerical operations and handling arrays.<br></div><div>- **Scikit-learn**: For implementing machine learning algorithms and preprocessing data.<br></div><div><br></div><div>## Conclusion<br></div><div>Exploratory Data Analysis is an indispensable part of the data science workflow. By employing EDA techniques, data scientists can uncover valuable insights that guide decision-making and model development. Mastering EDA in Python equips learners with the necessary skills to analyze real-world datasets effectively, paving the way for successful data-driven projects.<br></div><div><br></div><div>## Practical Application<br></div><div>In this course, you will engage in hands-on projects that will require you to apply EDA techniques to real-world datasets. This practical experience will reinforce your understanding and prepare you for data analysis tasks in professional settings.</div>	\N	\N	4	f	2026-02-20 16:27:35.371273	\N
385	104	10	Introduction to Flask	<div>Flask is a micro web framework written in Python that is designed to make web development simple and efficient. In this lesson, we will explore the fundamentals of Flask, its architecture, and how to set up your first web application. By the end of this lesson, you will have a solid understanding of how to create web applications using Flask, and you will be ready to dive deeper into more advanced topics.<br></div><div><br></div><div>### What is Flask?<br></div><div>Flask is a lightweight WSGI (Web Server Gateway Interface) web application framework that is easy to get started with and is flexible enough to scale up to complex applications. It was created by Armin Ronacher and is part of the Pallets Projects. Flask is often referred to as a micro-framework because it does not require particular tools or libraries, allowing developers to choose their components.<br></div><div><br></div><div>### Key Features of Flask<br></div><div>1. **Simplicity**: Flask is designed to be easy to use and learn, making it an excellent choice for beginners.<br></div><div>2. **Flexibility**: Unlike some other frameworks, Flask does not impose a specific structure, allowing developers to organize their projects as they see fit.<br></div><div>3. **Built-in Development Server**: Flask includes a built-in server for development purposes, which makes it easy to test your applications locally.<br></div><div>4. **Jinja2 Templating**: Flask uses Jinja2 for templating, allowing you to create dynamic HTML pages easily.<br></div><div>5. **RESTful Request Dispatching**: Flask supports RESTful request dispatching, making it a great choice for building APIs.<br></div><div><br></div><div>### Setting Up Flask<br></div><div>To get started with Flask, you need to have Python installed on your machine. Follow these steps to set up Flask:<br></div><div>1. **Install Flask**: You can install Flask using pip, the Python package manager. Open your terminal and run:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. **Create a Project Directory**: Create a new directory for your Flask project. For example:<br></div><div>   ```bash<br></div><div>   mkdir my_flask_app<br></div><div>   cd my_flask_app<br></div><div>   ```<br></div><div>3. **Create a Basic Flask Application**: Create a new Python file, `app.py`, and add the following code:<br></div><div>   ```python<br></div><div>   from flask import Flask<br></div><div>   app = Flask(__name__)<br></div><div><br></div><div>   @app.route('/')  # This is the home route<br></div><div>   def home():<br></div><div>       return 'Hello, Flask!'<br></div><div><br></div><div>   if __name__ == '__main__':<br></div><div>       app.run(debug=True)<br></div><div>   ```<br></div><div>4. **Run Your Application**: In your terminal, run the application by executing:<br></div><div>   ```bash<br></div><div>   python app.py<br></div><div>   ```<br></div><div>   You should see output indicating that the server is running. Open your web browser and go to `http://127.0.0.1:5000/` to see your Flask app in action.<br></div><div><br></div><div>### Understanding Flask Routing<br></div><div>Routing is a crucial concept in Flask that allows you to define the URL structure of your web application. In the example above, we defined a route using the `@app.route('/')` decorator. This tells Flask to execute the `home` function when the root URL is accessed. You can create additional routes by adding more decorators:<br></div><div>```python<br></div><div>@app.route('/about')<br></div><div>def about():<br></div><div>    return 'About Page'<br></div><div>```<br></div><div><br></div><div>### Flask Templates<br></div><div>Flask supports templates, which allow you to separate your HTML from your Python code. Create a new directory called `templates` in your project folder and add an HTML file, `index.html`:<br></div><div>```html<br></div><div><!DOCTYPE html><br></div><div><html><br></div><div><head><br></div><div>    <title>My Flask App</title><br></div><div></head><br></div><div><body><br></div><div>    <h1>{{ title }}</h1><br></div><div>    <p>Welcome to my Flask application!</p><br></div><div></body><br></div><div></html><br></div><div>```<br></div><div>You can render this template in your Flask app using:<br></div><div>```python<br></div><div>from flask import render_template<br></div><div><br></div><div>@app.route('/')<br></div><div>def home():<br></div><div>    return render_template('index.html', title='Home')<br></div><div>```<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we introduced Flask and its core features. You learned how to set up a basic Flask application, define routes, and use templates to create dynamic content. Flask's simplicity and flexibility make it an excellent choice for both beginners and experienced developers looking to build web applications quickly. In the upcoming lessons, we will explore more advanced concepts, such as working with databases, user authentication, and deploying your Flask applications. Get ready to take your Python skills to the next level!</div>	\N	\N	1	t	2026-02-20 16:27:35.380134	\N
386	104	10	Building RESTful APIs	<div>## Introduction to RESTful APIs<br></div><div><br></div><div>In the modern web development landscape, RESTful APIs (Representational State Transfer) have become a cornerstone for building scalable and efficient applications. They allow different software systems to communicate over HTTP using standard methods. This lesson will guide you through the principles of RESTful APIs, their components, and how to build one using Python.<br></div><div><br></div><div>## What is REST?<br></div><div><br></div><div>REST is an architectural style that defines a set of constraints and properties based on HTTP. It emphasizes stateless communication, where each request from a client contains all the information needed to process the request. RESTful APIs are designed around resources, which are identified by URLs. <br></div><div><br></div><div>### Key Principles of REST<br></div><div>1. **Statelessness**: Each request is independent, and the server does not store client context between requests.<br></div><div>2. **Client-Server Architecture**: The client and server are separate entities that communicate over HTTP, allowing for separation of concerns.<br></div><div>3. **Cacheability**: Responses must define themselves as cacheable or non-cacheable to improve performance.<br></div><div>4. **Uniform Interface**: A standardized way of interacting with resources, typically using standard HTTP methods like GET, POST, PUT, DELETE.<br></div><div>5. **Layered System**: The architecture can consist of multiple layers, with each layer having specific responsibilities.<br></div><div><br></div><div>## Components of a RESTful API<br></div><div><br></div><div>### Resources<br></div><div>Resources are the key components of a RESTful API. They represent data entities and are typically accessed via unique URLs. For example, in a bookstore API, resources could include `/books`, `/authors`, and `/genres`.<br></div><div><br></div><div>### HTTP Methods<br></div><div>RESTful APIs utilize standard HTTP methods to perform operations on resources:<br></div><div>- **GET**: Retrieve data from the server (e.g., get a list of books).<br></div><div>- **POST**: Create a new resource (e.g., add a new book).<br></div><div>- **PUT**: Update an existing resource (e.g., update book details).<br></div><div>- **DELETE**: Remove a resource (e.g., delete a book).<br></div><div><br></div><div>### Status Codes<br></div><div>HTTP status codes provide feedback about the outcome of API requests. Commonly used status codes include:<br></div><div>- **200 OK**: The request was successful.<br></div><div>- **201 Created**: A resource was successfully created.<br></div><div>- **204 No Content**: The request was successful, but there is no content to return.<br></div><div>- **400 Bad Request**: The server could not understand the request due to invalid syntax.<br></div><div>- **404 Not Found**: The requested resource could not be found.<br></div><div>- **500 Internal Server Error**: The server encountered an unexpected condition.<br></div><div><br></div><div>## Building a RESTful API with Python<br></div><div><br></div><div>In this section, we will build a simple RESTful API using Flask, a lightweight web framework for Python.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>1. Install Flask:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. Create a new Python file (e.g., `app.py`).<br></div><div><br></div><div>### Step 2: Creating the Flask Application<br></div><div>```python<br></div><div>from flask import Flask, jsonify, request<br></div><div><br></div><div>app = Flask(__name__)<br></div><div><br></div><div># Sample data<br></div><div>books = [<br></div><div>    {'id': 1, 'title': '1984', 'author': 'George Orwell'},<br></div><div>    {'id': 2, 'title': 'To Kill a Mockingbird', 'author': 'Harper Lee'}<br></div><div>]<br></div><div><br></div><div>@app.route('/books', methods=['GET'])<br></div><div>def get_books():<br></div><div>    return jsonify(books)<br></div><div><br></div><div>if __name__ == '__main__':<br></div><div>    app.run(debug=True)<br></div><div>```<br></div><div><br></div><div>### Step 3: Running the API<br></div><div>Run the application with:<br></div><div>```bash<br></div><div>python app.py<br></div><div>```<br></div><div>Visit `http://127.0.0.1:5000/books` in your browser or use a tool like Postman to see the JSON response of the book list.<br></div><div><br></div><div>### Step 4: Implementing CRUD Operations<br></div><div>Expand the API to include POST, PUT, and DELETE methods:<br></div><div>- **POST**: Add a new book.<br></div><div>- **PUT**: Update an existing book by ID.<br></div><div>- **DELETE**: Remove a book by ID.<br></div><div><br></div><div>### Example Code for CRUD Operations<br></div><div>```python<br></div><div>@app.route('/books', methods=['POST'])<br></div><div>def add_book():<br></div><div>    new_book = request.get_json()<br></div><div>    books.append(new_book)<br></div><div>    return jsonify(new_book), 201<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['PUT'])<br></div><div>def update_book(book_id):<br></div><div>    book = next((b for b in books if b['id'] == book_id), None)<br></div><div>    if book:<br></div><div>        data = request.get_json()<br></div><div>        book.update(data)<br></div><div>        return jsonify(book)<br></div><div>    return jsonify({'error': 'Book not found'}), 404<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['DELETE'])<br></div><div>def delete_book(book_id):<br></div><div>    global books<br></div><div>    books = [b for b in books if b['id'] != book_id]<br></div><div>    return jsonify({'result': True})<br></div><div>```<br></div><div><br></div><div>## Conclusion<br></div><div><br></div><div>Building RESTful APIs is an essential skill for Python developers. By understanding the principles of REST and implementing a simple API using Flask, you can create robust applications that facilitate communication between different systems. In this lesson, you learned about the core concepts of RESTful APIs, their components, and how to implement CRUD operations. This foundational knowledge will serve you well as you tackle more complex projects in your journey to mastering Python.</div>	\N	\N	2	f	2026-02-20 16:27:35.384113	\N
387	104	10	Database Integration	<div>In this lesson on Database Integration, we will explore the essential concepts and practical applications of integrating databases with Python. This is a crucial skill for any developer, especially those looking to build robust applications that manage and manipulate data efficiently.<br></div><div><br></div><div>### 1. Understanding Databases<br></div><div>Databases are structured collections of data that allow for efficient storage, retrieval, and management. There are various types of databases, including:<br></div><div>- **Relational Databases** (e.g., MySQL, PostgreSQL): These use structured query language (SQL) for defining and manipulating data.<br></div><div>- **NoSQL Databases** (e.g., MongoDB, Cassandra): These are designed for unstructured data and provide flexibility in data modeling.<br></div><div><br></div><div>### 2. Why Integrate Databases with Python?<br></div><div>Python is a versatile programming language that provides numerous libraries and frameworks for database integration. The benefits include:<br></div><div>- **Ease of Use**: Python’s syntax is clean and easy to understand, making it simple to write database queries and handle data.<br></div><div>- **Rich Ecosystem**: With libraries like SQLAlchemy, Django ORM, and PyMongo, Python can interact with various database systems seamlessly.<br></div><div>- **Data Manipulation**: Python excels at data manipulation and analysis, making it a perfect companion for databases.<br></div><div><br></div><div>### 3. Setting Up Your Environment<br></div><div>Before diving into database integration, ensure you have the following tools installed:<br></div><div>- **Python**: Ensure you have Python 3.x installed on your system.<br></div><div>- **Database**: Install a relational database like MySQL or a NoSQL database like MongoDB.<br></div><div>- **Libraries**: Install necessary libraries using pip. For example, for MySQL, you would use:<br></div><div>  ```bash<br></div><div>  pip install mysql-connector-python<br></div><div>  ```<br></div><div><br></div><div>### 4. Connecting to a Database<br></div><div>To connect to a database, you need to establish a connection using Python. Here’s a basic example using MySQL:<br></div><div>```python<br></div><div>import mysql.connector<br></div><div><br></div><div># Establishing a connection<br></div><div>connection = mysql.connector.connect(<br></div><div>    host='localhost',<br></div><div>    user='your_username',<br></div><div>    password='your_password',<br></div><div>    database='your_database'<br></div><div>)<br></div><div><br></div><div># Checking the connection<br></div><div>if connection.is_connected():<br></div><div>    print('Connected to the database')<br></div><div>```<br></div><div><br></div><div>### 5. Executing Queries<br></div><div>Once connected, you can execute SQL queries to interact with the database. Here’s how to create a table and insert data:<br></div><div>```python<br></div><div>cursor = connection.cursor()<br></div><div><br></div><div># Creating a table<br></div><div>create_table_query = '''CREATE TABLE users (<br></div><div>    id INT AUTO_INCREMENT PRIMARY KEY,<br></div><div>    name VARCHAR(255) NOT NULL,<br></div><div>    email VARCHAR(255) NOT NULL UNIQUE<br></div><div>)'''  <br></div><div>cursor.execute(create_table_query)<br></div><div><br></div><div># Inserting data<br></div><div>insert_query = "INSERT INTO users (name, email) VALUES (%s, %s)"<br></div><div>user_data = ('John Doe', 'john@example.com')<br></div><div>cursor.execute(insert_query, user_data)<br></div><div>connection.commit()<br></div><div><br></div><div>print('Data inserted successfully')<br></div><div>```<br></div><div><br></div><div>### 6. Retrieving Data<br></div><div>Retrieving data from the database is straightforward. You can use SELECT queries to fetch data:<br></div><div>```python<br></div><div># Retrieving data<br></div><div>select_query = "SELECT * FROM users"<br></div><div>cursor.execute(select_query)<br></div><div>result = cursor.fetchall()<br></div><div><br></div><div>for row in result:<br></div><div>    print(row)<br></div><div>```<br></div><div><br></div><div>### 7. Closing the Connection<br></div><div>Always remember to close the connection to the database once your operations are complete:<br></div><div>```python<br></div><div>cursor.close()<br></div><div>connection.close()<br></div><div>```<br></div><div><br></div><div>### 8. Best Practices<br></div><div>- **Use Parameterized Queries**: Prevent SQL injection attacks by using parameterized queries instead of string concatenation.<br></div><div>- **Error Handling**: Implement error handling using try-except blocks to manage exceptions gracefully.<br></div><div>- **Connection Pooling**: For applications with high database traffic, consider using connection pooling for efficiency.<br></div><div><br></div><div>### 9. Real-World Project Example<br></div><div>In your upcoming real-world project, you will integrate a database with a Python web application. You will:<br></div><div>- Design a database schema for user management.<br></div><div>- Implement CRUD (Create, Read, Update, Delete) operations.<br></div><div>- Use an ORM for easier data manipulation.<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we covered the fundamental aspects of database integration using Python. Mastering these concepts will empower you to build data-driven applications and enhance your programming skills. In the next lesson, we will dive deeper into advanced database management techniques and explore how to optimize database performance.</div>	\N	\N	3	f	2026-02-20 16:27:35.403544	\N
388	104	10	Deploying Web Applications	<div><h1>Deploying Web Applications</h1><br></div><div><p>In the final lesson of our course, 'Masters in Python with 5 Real-World Projects', we delve into the crucial topic of deploying web applications. Deployment is the process of making your web application accessible to users over the internet. This lesson will guide you through the various methods, tools, and best practices for deploying Python web applications effectively.</p><br></div><div><br></div><div><h2>1. Understanding Deployment</h2><br></div><div><p>Deployment involves several steps, including preparing your application, choosing a hosting environment, and ensuring that your application runs smoothly in a production setting. It’s essential to understand that deployment is not just a one-time event; it requires ongoing maintenance and updates.</p><br></div><div><br></div><div><h2>2. Preparing Your Application for Deployment</h2><br></div><div><p>Before deploying, ensure that your application is production-ready. This includes:</p><br></div><div><ul><br></div><div>  <li><strong>Code Optimization:</strong> Refactor your code for performance, remove debug statements, and ensure that your code adheres to best practices.</li><br></div><div>  <li><strong>Configuration Management:</strong> Separate configuration settings (like database credentials) from your codebase using environment variables or configuration files.</li><br></div><div>  <li><strong>Testing:</strong> Conduct thorough testing, including unit tests, integration tests, and user acceptance testing to ensure your application behaves as expected.</li><br></div><div></ul><br></div><div><br></div><div><h2>3. Choosing a Hosting Environment</h2><br></div><div><p>There are several options for hosting your web application:</p><br></div><div><ul><br></div><div>  <li><strong>Shared Hosting:</strong> Cost-effective but limited in resources and control. Suitable for small applications.</li><br></div><div>  <li><strong>Virtual Private Servers (VPS):</strong> Offers more control and resources than shared hosting, allowing you to install custom software.</li><br></div><div>  <li><strong>Cloud Hosting:</strong> Services like AWS, Google Cloud, and Azure provide scalable resources and flexibility, ideal for growing applications.</li><br></div><div>  <li><strong>Platform as a Service (PaaS):</strong> Solutions like Heroku and PythonAnywhere simplify deployment by managing the infrastructure for you.</li><br></div><div></ul><br></div><div><br></div><div><h2>4. Deployment Tools and Technologies</h2><br></div><div><p>Utilizing the right tools can streamline your deployment process. Here are some popular options:</p><br></div><div><ul><br></div><div>  <li><strong>Docker:</strong> Containerization allows you to package your application with all its dependencies, ensuring consistency across different environments.</li><br></div><div>  <li><strong>Continuous Integration/Continuous Deployment (CI/CD):</strong> Tools like Jenkins, GitHub Actions, and Travis CI automate the testing and deployment process, reducing the chances of human error.</li><br></div><div>  <li><strong>Web Servers:</strong> Familiarize yourself with web servers like Nginx and Apache, which serve your application to users.</li><br></div><div></ul><br></div><div><br></div><div><h2>5. Best Practices for Deployment</h2><br></div><div><p>To ensure a successful deployment, adhere to these best practices:</p><br></div><div><ul><br></div><div>  <li><strong>Version Control:</strong> Use Git to manage your codebase, enabling you to track changes and collaborate effectively.</li><br></div><div>  <li><strong>Monitoring and Logging:</strong> Implement monitoring tools (like New Relic or Sentry) and logging practices to track your application’s performance and catch issues early.</li><br></div><div>  <li><strong>Backup and Recovery:</strong> Regularly back up your data and have a recovery plan in place to minimize downtime in case of failure.</li><br></div><div></ul><br></div><div><br></div><div><h2>6. Conclusion</h2><br></div><div><p>Deploying web applications is a vital skill for any Python developer. By understanding the deployment process, preparing your application, choosing the right hosting environment, utilizing effective tools, and following best practices, you can ensure that your web application is robust, scalable, and ready for users. As you embark on your deployment journey, remember that continuous learning and adaptation are key to mastering this essential aspect of web development.</p><br></div><div><br></div><div><p>In the next section, we will explore hands-on deployment exercises using popular platforms, allowing you to apply what you’ve learned in this lesson.</p></div>	\N	\N	4	f	2026-02-20 16:27:35.412119	\N
389	105	10	Project 1: Personal Finance Tracker	<div>### Introduction to Personal Finance Tracker<br></div><div>In today's fast-paced world, managing personal finances is crucial for achieving financial stability and success. This lesson focuses on creating a Personal Finance Tracker using Python, which will help you understand your income, expenses, savings, and investments better. By the end of this project, you will have a functional application that can assist you in making informed financial decisions.<br></div><div><br></div><div>### Project Overview<br></div><div>The Personal Finance Tracker will be a console-based application that allows users to:<br></div><div>1. **Track Income**: Users can input their sources of income and the amounts received.<br></div><div>2. **Record Expenses**: Users can categorize and record their expenses, helping them understand where their money goes.<br></div><div>3. **View Reports**: The application will generate reports that summarize income, expenses, and savings over a specified period.<br></div><div>4. **Set Budgets**: Users can set monthly budgets for different categories and receive alerts when they are nearing their limits.<br></div><div><br></div><div>### Learning Objectives<br></div><div>By completing this project, you will learn to:<br></div><div>- Use Python to create a command-line interface (CLI) application.<br></div><div>- Work with data structures like lists and dictionaries to manage financial data.<br></div><div>- Implement basic file handling to save and load user data.<br></div><div>- Utilize functions and modules to organize your code effectively.<br></div><div>- Gain insights into personal finance management and budgeting strategies.<br></div><div><br></div><div>### Step-by-Step Implementation<br></div><div>#### Step 1: Setting Up Your Environment<br></div><div>Before you start coding, ensure you have Python installed on your machine. You can download it from the official Python website. Additionally, you may want to use an Integrated Development Environment (IDE) like PyCharm or Visual Studio Code for better code management.<br></div><div><br></div><div>#### Step 2: Designing the Application<br></div><div>- **Define the Data Model**: Decide how you will structure your data. A simple approach could be:<br></div><div>  - `income`: A list of dictionaries, each containing `source` and `amount`.<br></div><div>  - `expenses`: A list of dictionaries, each containing `category`, `description`, and `amount`.<br></div><div>  - `budget`: A dictionary mapping categories to budget limits.<br></div><div><br></div><div>- **User Interface**: Plan how users will interact with your application. A simple text-based menu can be effective:<br></div><div>  - 1. Add Income<br></div><div>  - 2. Add Expense<br></div><div>  - 3. View Reports<br></div><div>  - 4. Set Budget<br></div><div>  - 5. Exit<br></div><div><br></div><div>#### Step 3: Implementing Functionality<br></div><div>- **Add Income**: Create a function that prompts the user for income details and appends them to the income list.<br></div><div>- **Add Expense**: Similar to income, create a function to record expenses.<br></div><div>- **Generate Reports**: Implement a function that calculates total income, total expenses, and savings, and displays them in a user-friendly format.<br></div><div>- **Set Budget**: Allow users to input budget limits for different categories and check against expenses.<br></div><div><br></div><div>#### Step 4: File Handling<br></div><div>To ensure user data is preserved between sessions, implement file handling:<br></div><div>- Use the `json` module to save income and expense data to a JSON file.<br></div><div>- Load this data when the application starts, allowing users to continue from where they left off.<br></div><div><br></div><div>#### Step 5: Testing and Debugging<br></div><div>Once your application is built, thoroughly test it to ensure all functionalities work as expected. Look for edge cases, such as negative income or expenses, and handle them appropriately.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing the Personal Finance Tracker project, you will not only enhance your Python programming skills but also gain valuable insights into managing your finances effectively. This project serves as a practical application of programming concepts while addressing a real-world need. As you progress through the course, remember that the skills you acquire here will be applicable in various domains, making you a versatile Python developer.<br></div><div><br></div><div>### Next Steps<br></div><div>After finishing this project, consider enhancing your tracker by adding features such as:<br></div><div>- Graphical user interface (GUI) using libraries like Tkinter or PyQt.<br></div><div>- Integration with online banking APIs for automatic transaction updates.<br></div><div>- Data visualization tools to represent financial data graphically.<br></div><div><br></div><div>Happy coding and good luck with your financial journey!</div>	\N	\N	1	t	2026-02-20 16:27:35.419581	\N
390	105	10	Project 2: Weather Forecast App	<div>In this lesson, we will embark on an exciting journey to create a Weather Forecast App using Python. This project is designed to deepen your understanding of Python programming while applying real-world concepts such as API integration, data handling, and user interface design. By the end of this project, you will have a fully functional application that retrieves and displays weather information based on user input.<br></div><div><br></div><div>### Objectives<br></div><div>- Understand how to interact with APIs to fetch real-time data.<br></div><div>- Learn to parse JSON data and extract relevant information.<br></div><div>- Develop a user-friendly interface using Python libraries.<br></div><div>- Implement error handling to manage API response issues.<br></div><div><br></div><div>### Project Overview<br></div><div>The Weather Forecast App will allow users to enter a city name and receive current weather conditions, including temperature, humidity, and a brief description of the weather. We will utilize the OpenWeatherMap API, which provides comprehensive weather data in a structured format.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>Before we start coding, ensure you have the following installed:<br></div><div>- Python 3.x<br></div><div>- Requests library (for API calls)<br></div><div>- Tkinter (for GUI development)<br></div><div><br></div><div>You can install the Requests library using pip:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div><br></div><div>### Step 2: API Key Registration<br></div><div>1. Visit the [OpenWeatherMap website](https://openweathermap.org/api) and sign up for a free account.<br></div><div>2. Once registered, navigate to the API section and generate your API key. This key will be used to authenticate your requests.<br></div><div><br></div><div>### Step 3: Fetching Weather Data<br></div><div>Using the Requests library, we will make a GET request to the OpenWeatherMap API to retrieve weather data. Here’s a basic example:<br></div><div>```python<br></div><div>import requests<br></div><div><br></div><div>API_KEY = 'your_api_key'<br></div><div>BASE_URL = 'http://api.openweathermap.org/data/2.5/weather'<br></div><div><br></div><div>city_name = input('Enter city name: ')<br></div><div>complete_url = f'{BASE_URL}?q={city_name}&appid={API_KEY}&units=metric'<br></div><div><br></div><div>response = requests.get(complete_url)<br></div><div><br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    # Process the data<br></div><div>else:<br></div><div>    print('City not found')<br></div><div>```<br></div><div>In this code snippet, we construct the API URL with the user-provided city name and our API key. We then check if the response is successful and parse the JSON data.<br></div><div><br></div><div>### Step 4: Parsing the JSON Response<br></div><div>Once we receive the response, we need to extract relevant information. The JSON response contains various fields, but we are primarily interested in:<br></div><div>- Temperature<br></div><div>- Weather description<br></div><div>- Humidity<br></div><div><br></div><div>Here’s how we can extract this information:<br></div><div>```python<br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    main = data['main']<br></div><div>    weather = data['weather'][0]<br></div><div>    temperature = main['temp']<br></div><div>    humidity = main['humidity']<br></div><div>    weather_description = weather['description']<br></div><div>    print(f'Temperature: {temperature}°C')<br></div><div>    print(f'Humidity: {humidity}%')<br></div><div>    print(f'Weather: {weather_description}')<br></div><div>```<br></div><div>### Step 5: Building the User Interface<br></div><div>Now that we can fetch and display weather data in the console, let’s create a graphical user interface (GUI) using Tkinter. Here’s a simple example to get you started:<br></div><div>```python<br></div><div>import tkinter as tk<br></div><div><br></div><div>def get_weather():<br></div><div>    # Fetch weather data and update the label<br></div><div>    pass<br></div><div><br></div><div>root = tk.Tk()<br></div><div>root.title('Weather Forecast App')<br></div><div><br></div><div>city_label = tk.Label(root, text='Enter city name:')<br></div><div>city_label.pack()<br></div><div><br></div><div>city_entry = tk.Entry(root)<br></div><div>city_entry.pack()<br></div><div><br></div><div>get_button = tk.Button(root, text='Get Weather', command=get_weather)<br></div><div>get_button.pack()<br></div><div><br></div><div>weather_info = tk.Label(root, text='Weather info will be displayed here')<br></div><div>weather_info.pack()<br></div><div><br></div><div>root.mainloop()<br></div><div>```<br></div><div>This code creates a simple window with an entry box for the city name, a button to fetch the weather, and a label to display the results.<br></div><div><br></div><div>### Step 6: Error Handling<br></div><div>To ensure a smooth user experience, implement error handling. If the API returns an error (e.g., city not found), display an appropriate message in the GUI instead of crashing the app.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this project, you will have gained practical experience in API usage, data parsing, and GUI development in Python. This Weather Forecast App not only showcases your programming skills but also serves as a foundation for more complex applications in the future. Remember to explore additional features, such as a forecast for multiple days or integrating maps to enhance your app further. Happy coding!</div>	\N	\N	2	f	2026-02-20 16:27:35.422601	\N
391	105	10	Project 3: Blog Platform	<div><h1>Project 3: Blog Platform</h1><br></div><div><p>Welcome to Project 3 of the <strong>Masters in Python with 5 Real-World Projects</strong>. In this project, you will design and implement a fully functional blog platform using Python. This project will help you solidify your understanding of web development concepts, database management, and the MVC (Model-View-Controller) architecture.</p><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The goal of this project is to create a blog platform where users can create, edit, delete, and view blog posts. You will also implement user authentication to manage user accounts, allowing for a personalized experience. By the end of this project, you will have a robust understanding of how to build web applications using Python frameworks.</p><br></div><div><br></div><div><h2>Key Features</h2><br></div><div><ul><br></div><div>  <li><strong>User Authentication:</strong> Implement sign-up, login, and logout functionality.</li><br></div><div>  <li><strong>CRUD Operations:</strong> Allow users to Create, Read, Update, and Delete blog posts.</li><br></div><div>  <li><strong>Commenting System:</strong> Enable users to comment on blog posts.</li><br></div><div>  <li><strong>Responsive Design:</strong> Ensure the platform is mobile-friendly and accessible.</li><br></div><div>  <li><strong>Search Functionality:</strong> Allow users to search for blog posts by title or content.</li><br></div><div></ul><br></div><div><br></div><div><h2>Technologies Used</h2><br></div><div><p>This project will utilize several technologies, including:</p><br></div><div><ul><br></div><div>  <li><strong>Python:</strong> The primary programming language for backend development.</li><br></div><div>  <li><strong>Flask or Django:</strong> A web framework to facilitate the development of the web application.</li><br></div><div>  <li><strong>SQLite or PostgreSQL:</strong> A database to store user and blog post data.</li><br></div><div>  <li><strong>HTML/CSS/JavaScript:</strong> For frontend development and creating a user-friendly interface.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Steps</h2><br></div><div><ol><br></div><div>  <li><strong>Set Up Your Environment:</strong> Install the necessary tools and libraries (Flask/Django, database connectors, etc.).</li><br></div><div>  <li><strong>Create the Database:</strong> Design the database schema to store users, posts, and comments.</li><br></div><div>  <li><strong>Implement User Authentication:</strong> Use libraries like Flask-Login or Django's built-in authentication to manage user sessions.</li><br></div><div>  <li><strong>Develop CRUD Functionality:</strong> Create routes and views for adding, editing, and deleting posts.</li><br></div><div>  <li><strong>Add Commenting System:</strong> Allow users to leave comments on blog posts and manage them.</li><br></div><div>  <li><strong>Design the User Interface:</strong> Use HTML and CSS to create a clean and engaging layout.</li><br></div><div>  <li><strong>Test the Application:</strong> Perform thorough testing to ensure all features work as intended.</li><br></div><div>  <li><strong>Deploy the Application:</strong> Use platforms like Heroku or DigitalOcean to host your blog platform.</li><br></div><div></ol><br></div><div><br></div><div><h2>Learning Outcomes</h2><br></div><div><p>Upon completing this project, you will have gained:</p><br></div><div><ul><br></div><div>  <li>A strong understanding of web application architecture.</li><br></div><div>  <li>Experience with user authentication and session management.</li><br></div><div>  <li>Skills in database design and management.</li><br></div><div>  <li>Proficiency in frontend and backend integration.</li><br></div><div>  <li>Knowledge of deploying web applications to cloud platforms.</li><br></div><div></ul><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>This blog platform project is a significant step in your journey to mastering Python and web development. It combines various essential skills and concepts that are critical for building real-world applications. Embrace the challenges, and enjoy the process of creating your own blog platform!</p></div>	\N	\N	3	f	2026-02-20 16:27:35.437208	\N
392	105	10	Project 4: E-commerce Website	<div>In this lesson, we will delve into Project 4 of the 'Masters in Python with 5 Real-World Projects' course, where you will create a fully functional e-commerce website. This project is designed to consolidate your Python skills while providing you with hands-on experience in web development. <br></div><div><br></div><div>### Introduction to E-commerce Websites<br></div><div>E-commerce websites facilitate online buying and selling of products and services. They are essential in today's digital economy, providing businesses with a platform to reach a global audience. In this project, you will learn how to build a robust e-commerce site using Python, Flask, and various other technologies.<br></div><div><br></div><div>### Objectives of the Project<br></div><div>By the end of this project, you will be able to:<br></div><div>1. **Understand the architecture of an e-commerce website**: Learn about the front-end and back-end components, including user interfaces, databases, and server-side logic.<br></div><div>2. **Implement user authentication**: Create secure login and registration systems for customers.<br></div><div>3. **Design a product catalog**: Build a dynamic catalog where users can browse products, filter by categories, and view detailed product information.<br></div><div>4. **Integrate a shopping cart**: Allow users to add, remove, and modify items in their shopping cart.<br></div><div>5. **Process payments securely**: Implement payment processing using APIs such as Stripe or PayPal.<br></div><div>6. **Deploy your website**: Learn how to host your e-commerce site on a cloud platform.<br></div><div><br></div><div>### Tools and Technologies Used<br></div><div>- **Python**: The primary programming language for backend development.<br></div><div>- **Flask**: A lightweight web framework that allows you to build web applications quickly.<br></div><div>- **HTML/CSS**: For structuring and styling the front-end of your website.<br></div><div>- **JavaScript**: To enhance user experience with interactive features.<br></div><div>- **SQLAlchemy**: For database management and ORM (Object Relational Mapping).<br></div><div>- **Bootstrap**: A front-end framework to design responsive web pages.<br></div><div>- **Stripe/PayPal API**: For secure payment processing.<br></div><div><br></div><div>### Project Structure<br></div><div>1. **Setting Up Your Environment**: Start by setting up a virtual environment and installing necessary libraries. Create a project folder structure that separates your static files, templates, and application logic.<br></div><div>2. **Creating the Database**: Use SQLAlchemy to define your database models for users, products, and orders. Establish relationships between these models to ensure data integrity.<br></div><div>3. **Building the Backend**: Develop the backend logic using Flask. Implement routes for user registration, login, product listing, and cart management. Ensure to handle errors and exceptions gracefully.<br></div><div>4. **Designing the Frontend**: Use HTML, CSS, and Bootstrap to create a user-friendly interface. Design pages for product listings, product details, cart, and checkout.<br></div><div>5. **Implementing User Authentication**: Use Flask-Login for managing user sessions and protecting routes that require authentication.<br></div><div>6. **Integrating Payment Processing**: Follow the documentation of your chosen payment processor to set up secure payment handling. Ensure to test transactions in a sandbox environment before going live.<br></div><div>7. **Testing Your Application**: Conduct thorough testing to identify and fix bugs. Consider both unit tests for individual components and integration tests for the entire application.<br></div><div>8. **Deployment**: Choose a cloud service provider (like Heroku, AWS, or DigitalOcean) to deploy your application. Ensure you configure the environment variables and database settings correctly.<br></div><div><br></div><div>### Conclusion<br></div><div>Completing this project will not only enhance your Python skills but will also give you a valuable portfolio piece that demonstrates your ability to build real-world applications. E-commerce is a booming field, and having practical experience in creating an e-commerce website will open doors for various career opportunities in web development and software engineering.<br></div><div><br></div><div>### Next Steps<br></div><div>As you embark on this project, remember to break it down into manageable tasks and set milestones to track your progress. Join forums or study groups to discuss challenges and share insights. Good luck, and enjoy the process of bringing your e-commerce vision to life!</div>	\N	\N	4	f	2026-02-20 16:27:35.45238	\N
393	105	10	Project 5: Data Analysis Dashboard	<div><h1>Project 5: Data Analysis Dashboard</h1><br></div><div><p>Welcome to Project 5 of the 'Masters in Python with 5 Real-World Projects' course! In this project, you will learn how to create a comprehensive Data Analysis Dashboard using Python. This dashboard will allow users to visualize and interact with data, making it easier to derive insights and make data-driven decisions.</p><br></div><div><br></div><div><h2>Objectives</h2><br></div><div><ul><br></div><div>    <li>Understand the fundamentals of data visualization.</li><br></div><div>    <li>Learn to use Python libraries such as Pandas, Matplotlib, and Plotly.</li><br></div><div>    <li>Build an interactive dashboard using Dash or Streamlit.</li><br></div><div>    <li>Implement data filtering and aggregation techniques.</li><br></div><div>    <li>Deploy your dashboard for real-world use.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The primary goal of this project is to develop a Data Analysis Dashboard that can handle various datasets and present key metrics through interactive visualizations. You will work with real-world data, allowing you to apply the skills you have acquired throughout the course.</p><br></div><div><br></div><div><h2>Step-by-Step Guide</h2><br></div><div><h3>1. Data Acquisition</h3><br></div><div><p>Start by selecting a dataset relevant to your interests or industry. Popular sources include:</p><br></div><div><ul><br></div><div>    <li><a href='https://www.kaggle.com/'>Kaggle</a></li><br></div><div>    <li><a href='https://data.gov/'>Data.gov</a></li><br></div><div>    <li><a href='https://www.uci.edu/'>UCI Machine Learning Repository</a></li><br></div><div></ul><br></div><div><p>Once you have selected your dataset, download it in a suitable format (CSV, JSON, etc.).</p><br></div><div><br></div><div><h3>2. Data Preparation</h3><br></div><div><p>Utilize Pandas to clean and preprocess your data. This includes:</p><br></div><div><ul><br></div><div>    <li>Handling missing values.</li><br></div><div>    <li>Normalizing data formats.</li><br></div><div>    <li>Filtering out unnecessary columns.</li><br></div><div></ul><br></div><div><p>Ensure your data is ready for analysis by performing exploratory data analysis (EDA) to understand its structure and key features.</p><br></div><div><br></div><div><h3>3. Data Visualization</h3><br></div><div><p>Use Matplotlib and Plotly to create visualizations that represent your data effectively. Consider the following types of visualizations:</p><br></div><div><ul><br></div><div>    <li>Bar charts for categorical data.</li><br></div><div>    <li>Line graphs for trends over time.</li><br></div><div>    <li>Heatmaps for correlation matrices.</li><br></div><div></ul><br></div><div><p>Make sure your visualizations are clear, informative, and aesthetically pleasing.</p><br></div><div><br></div><div><h3>4. Building the Dashboard</h3><br></div><div><p>Choose a framework like Dash or Streamlit to create your interactive dashboard. Key components to include:</p><br></div><div><ul><br></div><div>    <li>Dropdowns for selecting data filters.</li><br></div><div>    <li>Sliders for adjusting parameters.</li><br></div><div>    <li>Graphs that update dynamically based on user input.</li><br></div><div></ul><br></div><div><p>Focus on user experience by ensuring that the dashboard is intuitive and responsive.</p><br></div><div><br></div><div><h3>5. Deployment</h3><br></div><div><p>Once your dashboard is complete, deploy it using platforms such as Heroku or Streamlit Sharing. This allows users to access your dashboard from anywhere, providing a real-world application of your project.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>By the end of this project, you will have developed a fully functional Data Analysis Dashboard that showcases your ability to manipulate data, create visualizations, and build interactive applications using Python. This project not only enhances your technical skills but also prepares you for real-world data analysis challenges.</p><br></div><div><br></div><div><h2>Next Steps</h2><br></div><div><p>After completing this project, consider exploring additional features such as user authentication, advanced analytics, or integrating machine learning models to further enhance your dashboard's capabilities. The skills you gain here will be invaluable in your journey as a data professional.</p></div>	\N	\N	5	f	2026-02-20 16:27:35.467131	\N
394	106	9	Getting Started with Python	<div>Welcome to 'Getting Started with Python,' the first lesson in the 'Masters in Python with 5 Real-World Projects' course! In this lesson, we will delve into the fundamentals of Python programming, setting a solid foundation for your journey into the world of coding. Whether you are a complete beginner or looking to brush up on your skills, this lesson is designed to equip you with the essential knowledge and tools to start programming in Python.<br></div><div><br></div><div>### 1. Introduction to Python<br></div><div>Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, Python has gained immense popularity among developers due to its versatility and ease of use. It is widely used in various domains, including web development, data analysis, artificial intelligence, scientific computing, and more.<br></div><div><br></div><div>### 2. Why Learn Python?<br></div><div>- **Easy to Read and Write**: Python's syntax is clear and intuitive, making it an excellent choice for beginners.<br></div><div>- **Versatile**: Python can be used for a wide range of applications, from simple scripts to complex machine learning algorithms.<br></div><div>- **Strong Community Support**: Python has a large and active community, providing extensive libraries and frameworks that can help you solve problems more efficiently.<br></div><div>- **Career Opportunities**: Proficiency in Python opens doors to numerous job opportunities in various fields, including software development, data science, and automation.<br></div><div><br></div><div>### 3. Setting Up Your Python Environment<br></div><div>Before you start coding, you need to set up your development environment. Here’s how:<br></div><div>- **Download and Install Python**: Visit the official Python website (https://www.python.org/downloads/) and download the latest version for your operating system. Follow the installation instructions.<br></div><div>- **Choose an Integrated Development Environment (IDE)**: While you can write Python code in any text editor, using an IDE can enhance your coding experience. Popular choices include:<br></div><div>  - **PyCharm**: A powerful IDE specifically for Python.<br></div><div>  - **Visual Studio Code**: A lightweight editor with Python support through extensions.<br></div><div>  - **Jupyter Notebook**: Ideal for data analysis and visualization, allowing you to create interactive notebooks.<br></div><div><br></div><div>### 4. Your First Python Program<br></div><div>Let’s write a simple Python program to get you started:<br></div><div>```python<br></div><div>print('Hello, World!')<br></div><div>```<br></div><div>This program uses the `print()` function to display the text 'Hello, World!' on the screen. To run this program:<br></div><div>1. Open your chosen IDE.<br></div><div>2. Create a new Python file (e.g., `hello.py`).<br></div><div>3. Type the code above and save the file.<br></div><div>4. Run the program by executing the command `python hello.py` in your terminal or using the run option in your IDE.<br></div><div><br></div><div>### 5. Understanding Python Basics<br></div><div>Before diving deeper, it's crucial to understand some basic concepts:<br></div><div>- **Variables**: Store data values. Example: `name = 'Alice'`<br></div><div>- **Data Types**: Python has several built-in data types, including integers, floats, strings, and lists.<br></div><div>- **Control Structures**: Learn about conditionals (`if`, `else`) and loops (`for`, `while`) to control the flow of your program.<br></div><div>- **Functions**: Functions allow you to encapsulate code for reuse. Example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    print(f'Hello, {name}!')<br></div><div>```<br></div><div><br></div><div>### 6. Next Steps<br></div><div>Congratulations on taking the first step in your Python journey! In the next lessons, we will explore more advanced topics, including data structures, object-oriented programming, and libraries that will enable you to work on real-world projects. Make sure to practice coding regularly and engage with the Python community through forums and coding challenges.<br></div><div><br></div><div>### 7. Resources for Further Learning<br></div><div>- **Official Python Documentation**: https://docs.python.org/3/<br></div><div>- **Codecademy Python Course**: A great interactive platform to learn Python basics.<br></div><div>- **LeetCode**: Practice coding problems to enhance your problem-solving skills.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this lesson, you have laid the groundwork for a successful learning experience in Python. Remember, the key to mastering programming is consistent practice and exploration. Embrace the challenges ahead and enjoy your programming journey!</div>	https://youtube.com/embed/t2_Q2BRzeEE	\N	1	t	2026-02-20 16:27:42.75006	https://our-shiksha.trainercentral.in/course/attend?previouspage=clientapp#/course/23063000000028276/attend/section/23063000000028284
395	106	9	Python Syntax and Semantics	<div>In this lesson, we will delve into the fundamental concepts of Python syntax and semantics, which are essential for any aspiring Python developer. Understanding these concepts is crucial as they form the foundation upon which you will build your programming skills. Let's break down these concepts into manageable sections.<br></div><div><br></div><div>### 1. Introduction to Syntax<br></div><div>Python syntax refers to the set of rules that define the combinations of symbols that are considered to be correctly structured programs in the Python language. Syntax governs how we write Python code, including how we structure statements, define variables, and use functions.<br></div><div><br></div><div>- **Basic Structure**: Every Python program is made up of statements that are executed in a specific order. The basic structure includes:<br></div><div>  - **Variables**: Used to store data values. For example, `x = 5` assigns the integer 5 to the variable `x`.<br></div><div>  - **Data Types**: Python supports various data types, including integers, floats, strings, and booleans.<br></div><div>  - **Indentation**: Python uses indentation to define the scope of loops, functions, and conditionals. This is a unique feature of Python that distinguishes it from many other programming languages.<br></div><div><br></div><div>### 2. Key Syntax Elements<br></div><div>Let's explore some key elements of Python syntax:<br></div><div><br></div><div>- **Comments**: Use the `#` symbol to write comments in your code, which are ignored by the interpreter. Example: `# This is a comment`<br></div><div>- **Operators**: Python includes various operators for arithmetic, comparison, and logical operations. For instance, `+`, `-`, `*`, and `/` are arithmetic operators.<br></div><div>- **Control Structures**: These include `if`, `for`, and `while` statements, which allow you to control the flow of your program based on conditions.<br></div><div><br></div><div>### 3. Understanding Semantics<br></div><div>While syntax focuses on the structure of the code, semantics refers to the meaning behind the code. It deals with what the code does when it is executed. Understanding semantics is crucial for writing effective and efficient code.<br></div><div><br></div><div>- **Execution Flow**: The semantics of Python dictate how the code is executed. For example, in a conditional statement, the code block under the `if` statement will only execute if the condition evaluates to `True`.<br></div><div>- **Function Behavior**: When you define a function, the semantics define what happens when the function is called. For instance, `def add(a, b): return a + b` means that when you call `add(2, 3)`, it will return `5`.<br></div><div><br></div><div>### 4. Common Syntax Errors<br></div><div>As you begin coding in Python, you may encounter syntax errors. These occur when the code does not conform to the rules of the language. Common syntax errors include:<br></div><div>- **Indentation Errors**: Occur when the indentation levels are inconsistent.<br></div><div>- **Syntax Errors**: Occur when there is a typo or incorrect use of Python syntax, such as missing colons or parentheses.<br></div><div><br></div><div>### 5. Best Practices<br></div><div>To write clean and effective Python code, consider the following best practices:<br></div><div>- **Consistent Indentation**: Always use the same number of spaces (usually 4) for indentation.<br></div><div>- **Meaningful Variable Names**: Use descriptive names for variables and functions to enhance code readability.<br></div><div>- **Comment Your Code**: Write comments to explain complex logic or important sections of your code.<br></div><div><br></div><div>### Conclusion<br></div><div>In summary, mastering Python syntax and semantics is a critical step in your journey as a Python developer. By understanding the rules of the language and the meaning behind your code, you will be better equipped to write efficient, readable, and maintainable programs. In the next lesson, we will explore data types and variables in greater detail, allowing you to apply your understanding of syntax and semantics to practical programming tasks.</div>	\N	\N	2	f	2026-02-20 16:27:42.75457	\N
396	106	9	Data Types and Variables	<div><h1>Understanding Data Types and Variables in Python</h1><br></div><div><br></div><div><p>In the world of programming, data types and variables are foundational concepts that every programmer must grasp. This lesson will delve into the essence of data types, the significance of variables, and how they interact within the Python programming language.</p><br></div><div><br></div><div><h2>What are Data Types?</h2><br></div><div><p>Data types are classifications that dictate what kind of data can be stored and manipulated within a program. Python, being a dynamically typed language, automatically determines the type of a variable at runtime. Here are the primary data types in Python:</p><br></div><div><br></div><div><ul><br></div><div>  <li><strong>Integers (int):</strong> Whole numbers, both positive and negative, without decimals. Example: 5, -3, 42.</li><br></div><div>  <li><strong>Floating Point Numbers (float):</strong> Numbers that contain a decimal point. Example: 3.14, -0.001, 2.0.</li><br></div><div>  <li><strong>Strings (str):</strong> Sequences of characters enclosed in single or double quotes. Example: 'Hello, World!', "Python".</li><br></div><div>  <li><strong>Booleans (bool):</strong> Represents one of two values: True or False. Useful for conditional statements.</li><br></div><div>  <li><strong>Lists:</strong> Ordered collections of items, which can be of mixed data types. Example: [1, 2.5, 'Python', True].</li><br></div><div>  <li><strong>Dictionaries:</strong> Unordered collections of key-value pairs. Example: {'name': 'Alice', 'age': 30}.</li><br></div><div>  <li><strong>Tuples:</strong> Immutable ordered collections. Example: (1, 2, 3).</li><br></div><div>  <li><strong>Sets:</strong> Unordered collections of unique items. Example: {1, 2, 3}.</li><br></div><div></ul><br></div><div><br></div><div><h2>What are Variables?</h2><br></div><div><p>Variables are symbolic names that represent data values. They act as containers for storing data that can be referenced and manipulated throughout your program. In Python, variables are created by simply assigning a value to a name using the assignment operator (=).</p><br></div><div><br></div><div><h3>Variable Naming Rules</h3><br></div><div><p>When creating variables, it's important to follow certain naming conventions:</p><br></div><div><ul><br></div><div>  <li>Variable names must start with a letter (a-z, A-Z) or an underscore (_).</li><br></div><div>  <li>Subsequent characters can be letters, numbers (0-9), or underscores.</li><br></div><div>  <li>Variable names are case-sensitive (e.g., <code>myVar</code> and <code>myvar</code> are different).</li><br></div><div>  <li>Avoid using reserved keywords (e.g., <code>if</code>, <code>else</code>, <code>for</code>, etc.).</li><br></div><div></ul><br></div><div><br></div><div><h3>Assigning Values to Variables</h3><br></div><div><p>To assign a value to a variable, use the following syntax:</p><br></div><div><pre><code>variable_name = value</code></pre><br></div><div><p>For example:</p><br></div><div><pre><code>age = 25<br></div><div>name = 'John'<br></div><div>height = 5.9<br></div><div>is_student = True</code></pre><br></div><div><br></div><div><h2>Type Checking and Conversion</h2><br></div><div><p>In Python, you can check the type of a variable using the <code>type()</code> function:</p><br></div><div><pre><code>print(type(age))  # Output: <class 'int'></code></pre><br></div><div><p>If you need to convert between data types, Python provides built-in functions such as <code>int()</code>, <code>float()</code>, and <code>str()</code>:</p><br></div><div><pre><code>num_str = '10'<br></div><div>num_int = int(num_str)  # Converts string to integer</code></pre><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Data types and variables are crucial to understanding how to store and manipulate data in Python. Mastering these concepts will empower you to write more efficient and effective code. In the next lesson, we will explore control structures that allow you to manage the flow of your programs.</p></div>	\N	\N	3	f	2026-02-20 16:27:42.758566	\N
397	106	9	Control Structures	<div>In this lesson, we will delve into the essential concept of control structures in Python, which serve as the foundation for making decisions, repeating actions, and managing the flow of programs. Control structures allow programmers to dictate the order in which statements are executed, enabling the creation of dynamic and responsive applications.<br></div><div><br></div><div>### 1. Introduction to Control Structures<br></div><div>Control structures are constructs that dictate the flow of control in a program. They can be broadly categorized into three types:<br></div><div>- **Sequential Structures**: The default mode of execution where statements are executed one after another.<br></div><div>- **Selection Structures**: Allow the program to choose different paths based on conditions (e.g., `if`, `elif`, `else`).<br></div><div>- **Repetition Structures**: Enable the execution of a block of code multiple times (e.g., `for` loops, `while` loops).<br></div><div><br></div><div>### 2. Selection Structures<br></div><div>Selection structures are crucial for decision-making in code. Let's explore the key components:<br></div><div><br></div><div>#### 2.1 The `if` Statement<br></div><div>The `if` statement evaluates a condition and executes a block of code if the condition is true.<br></div><div>```python<br></div><div>age = 18<br></div><div>if age >= 18:<br></div><div>    print('You are eligible to vote.')<br></div><div>```<br></div><div>In this example, the message is printed only if the `age` variable is 18 or older.<br></div><div><br></div><div>#### 2.2 The `elif` and `else` Statements<br></div><div>To handle multiple conditions, we use `elif` (else if) and `else` statements. This allows for more complex decision-making.<br></div><div>```python<br></div><div>score = 85<br></div><div>if score >= 90:<br></div><div>    print('Grade: A')<br></div><div>elif score >= 80:<br></div><div>    print('Grade: B')<br></div><div>else:<br></div><div>    print('Grade: C')<br></div><div>```<br></div><div>Here, the program checks the score and prints the corresponding grade based on the defined conditions.<br></div><div><br></div><div>### 3. Repetition Structures<br></div><div>Repetition structures allow us to execute a block of code multiple times, which is essential for tasks like iterating over data.<br></div><div><br></div><div>#### 3.1 The `for` Loop<br></div><div>The `for` loop is used to iterate over a sequence (like a list, tuple, or string).<br></div><div>```python<br></div><div>fruits = ['apple', 'banana', 'cherry']<br></div><div>for fruit in fruits:<br></div><div>    print(fruit)<br></div><div>```<br></div><div>In this example, each fruit in the list is printed one by one.<br></div><div><br></div><div>#### 3.2 The `while` Loop<br></div><div>The `while` loop continues to execute as long as a specified condition is true.<br></div><div>```python<br></div><div>count = 0<br></div><div>while count < 5:<br></div><div>    print(count)<br></div><div>    count += 1<br></div><div>```<br></div><div>This loop will print numbers from 0 to 4, demonstrating how conditions can control the flow of execution.<br></div><div><br></div><div>### 4. Nested Control Structures<br></div><div>Control structures can also be nested within each other, allowing for more complex logic. For instance, you can have an `if` statement inside a loop:<br></div><div>```python<br></div><div>for number in range(10):<br></div><div>    if number % 2 == 0:<br></div><div>        print(f'{number} is even')<br></div><div>    else:<br></div><div>        print(f'{number} is odd')<br></div><div>```<br></div><div>This code checks each number from 0 to 9 and prints whether it is even or odd.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>Understanding control structures is vital for any Python programmer. They allow you to build programs that can respond to different inputs and conditions, making your applications more versatile and powerful. In the upcoming lessons, we will apply these concepts in real-world projects, enhancing your skills and preparing you for practical programming challenges. <br></div><div><br></div><div>### 6. Practice Exercises<br></div><div>To solidify your understanding, try the following exercises:<br></div><div>1. Write a program that checks if a number is positive, negative, or zero using control structures.<br></div><div>2. Create a multiplication table using a nested loop.<br></div><div>3. Develop a simple quiz application that evaluates user input and provides feedback based on their answers.<br></div><div><br></div><div>By mastering control structures, you will be well on your way to becoming a proficient Python developer, ready to tackle more advanced topics and projects.</div>	\N	\N	4	f	2026-02-20 16:27:42.762876	\N
398	107	9	Functions and Modules	<div>In this lesson, we will delve into two fundamental concepts in Python programming: Functions and Modules. Understanding these concepts is crucial for writing clean, efficient, and reusable code. Let's explore each of these topics in detail.<br></div><div><br></div><div>### 1. Functions in Python<br></div><div>Functions are reusable blocks of code that perform a specific task. They help in organizing code, making it more readable, and reducing redundancy. Here are some key aspects of functions:<br></div><div><br></div><div>#### 1.1 Defining a Function<br></div><div>To define a function in Python, we use the `def` keyword followed by the function name and parentheses. Here’s a simple example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    return f'Hello, {name}!'<br></div><div>```<br></div><div>This function, `greet`, takes one parameter, `name`, and returns a greeting message.<br></div><div><br></div><div>#### 1.2 Calling a Function<br></div><div>Once a function is defined, you can call it by using its name followed by parentheses:<br></div><div>```python<br></div><div>print(greet('Alice'))  # Output: Hello, Alice!<br></div><div>```<br></div><div><br></div><div>#### 1.3 Function Parameters and Arguments<br></div><div>Functions can accept parameters, allowing you to pass values into them. There are several types of parameters:<br></div><div>- **Positional Parameters**: These are parameters that must be provided in a specific order.<br></div><div>- **Keyword Parameters**: These allow you to specify parameters by name, making your code more readable.<br></div><div>- **Default Parameters**: You can set default values for parameters, making them optional.<br></div><div><br></div><div>Example:<br></div><div>```python<br></div><div>def greet(name, greeting='Hello'):<br></div><div>    return f'{greeting}, {name}!'<br></div><div>```<br></div><div><br></div><div>#### 1.4 Return Statement<br></div><div>The `return` statement is used to exit a function and send a value back to the caller. If no return statement is specified, the function returns `None` by default.<br></div><div><br></div><div>### 2. Scope of Variables<br></div><div>Understanding variable scope is essential when working with functions. Variables defined inside a function are local to that function and cannot be accessed outside of it. Conversely, variables defined outside functions are global and can be accessed anywhere in the code.<br></div><div><br></div><div>### 3. Modules in Python<br></div><div>Modules are files containing Python code that can define functions, classes, and variables. They allow you to organize your code into manageable sections and promote code reuse.<br></div><div><br></div><div>#### 3.1 Creating a Module<br></div><div>To create a module, simply save your Python code in a file with a `.py` extension. For example, if you create a file named `math_operations.py` with the following content:<br></div><div>```python<br></div><div>def add(a, b):<br></div><div>    return a + b<br></div><div><br></div><div>def subtract(a, b):<br></div><div>    return a - b<br></div><div>```<br></div><div><br></div><div>#### 3.2 Importing a Module<br></div><div>You can import a module into another Python file using the `import` statement. For example:<br></div><div>```python<br></div><div>import math_operations<br></div><div><br></div><div>result = math_operations.add(5, 3)<br></div><div>print(result)  # Output: 8<br></div><div>```<br></div><div><br></div><div>#### 3.3 Using `from` to Import Specific Functions<br></div><div>You can also import specific functions from a module using the `from` keyword:<br></div><div>```python<br></div><div>from math_operations import subtract<br></div><div><br></div><div>result = subtract(10, 4)<br></div><div>print(result)  # Output: 6<br></div><div>```<br></div><div><br></div><div>### 4. Benefits of Using Functions and Modules<br></div><div>- **Code Reusability**: Functions and modules allow you to reuse code, saving time and reducing errors.<br></div><div>- **Improved Readability**: Breaking down code into functions and modules makes it easier to read and understand.<br></div><div>- **Easier Maintenance**: When you need to make changes, you can do so in one place rather than throughout your codebase.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>In this lesson, we covered the essential aspects of functions and modules in Python. Mastering these concepts will significantly enhance your programming skills and prepare you for more complex projects. In the next lesson, we will explore error handling and debugging techniques, which are vital for developing robust applications.</div>	\N	\N	1	t	2026-02-20 16:27:42.769257	\N
399	107	9	Object-Oriented Programming	<div><h1>Understanding Object-Oriented Programming (OOP)</h1><br></div><div><p>Object-Oriented Programming (OOP) is a programming paradigm that uses 'objects' to represent data and methods to manipulate that data. It is a foundational concept in Python and many other programming languages, allowing for code reusability, scalability, and ease of maintenance.</p><br></div><div><br></div><div><h2>Key Concepts of OOP</h2><br></div><div><ul><br></div><div>  <li><strong>Classes:</strong> A class is a blueprint for creating objects. It defines a set of attributes and methods that the created objects will have. For example, a class <code>Car</code> might have attributes like <code>color</code> and <code>model</code>, and methods like <code>drive()</code> and <code>stop()</code>.</li><br></div><div>  <li><strong>Objects:</strong> An object is an instance of a class. Using the <code>Car</code> class, you can create objects like <code>my_car = Car('red', 'Toyota')</code>. Each object can have different attribute values while sharing the same methods.</li><br></div><div>  <li><strong>Encapsulation:</strong> This principle restricts direct access to some of an object's components, which can prevent the accidental modification of data. In Python, you can use private and public attributes to enforce encapsulation.</li><br></div><div>  <li><strong>Inheritance:</strong> Inheritance allows a new class to inherit the properties and methods of an existing class. This promotes code reusability. For instance, you can create a class <code>ElectricCar</code> that inherits from <code>Car</code> and adds additional features like <code>charge()</code>.</li><br></div><div>  <li><strong>Polymorphism:</strong> Polymorphism allows methods to do different things based on the object it is acting upon. This means that a method can be defined in a base class and overridden in a derived class, enabling different behaviors.</li><br></div><div></ul><br></div><div><br></div><div><h2>Why Use OOP in Python?</h2><br></div><div><p>OOP provides several advantages that can enhance your programming experience and the quality of your code:</p><br></div><div><ul><br></div><div>  <li><strong>Modularity:</strong> Code can be organized into classes and modules, making it easier to manage and understand.</li><br></div><div>  <li><strong>Reusability:</strong> Classes can be reused across different projects, reducing redundancy and saving time.</li><br></div><div>  <li><strong>Maintainability:</strong> Changes to a class can be made in one place, and those changes will propagate to all instances of the class.</li><br></div><div>  <li><strong>Collaboration:</strong> OOP makes it easier for teams to work on different parts of a project simultaneously, as each team can focus on different classes.</li><br></div><div></ul><br></div><div><br></div><div><h2>Implementing OOP in Python</h2><br></div><div><p>Here’s a simple example to illustrate how to implement OOP in Python:</p><br></div><div><pre><code>class Car:<br></div><div>    def __init__(self, color, model):<br></div><div>        self.color = color<br></div><div>        self.model = model<br></div><div><br></div><div>    def drive(self):<br></div><div>        print(f'The {self.color} {self.model} is driving.')<br></div><div><br></div><div>class ElectricCar(Car):<br></div><div>    def charge(self):<br></div><div>        print(f'The {self.color} {self.model} is charging.')<br></div><div><br></div><div># Creating objects<br></div><div>my_car = Car('red', 'Toyota')<br></div><div>my_car.drive()<br></div><div><br></div><div>my_electric_car = ElectricCar('blue', 'Tesla')<br></div><div>my_electric_car.drive()<br></div><div>my_electric_car.charge()</code></pre><br></div><div><p>In this example, we define a base class <code>Car</code> and a derived class <code>ElectricCar</code>. The derived class inherits the properties and methods of the base class while adding its own functionality.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Object-Oriented Programming is an essential skill for any Python developer. Understanding its principles will not only improve your coding abilities but also prepare you for real-world programming tasks. By mastering OOP, you can create more efficient, scalable, and maintainable code. As you progress in this course, you will apply these concepts in real-world projects, solidifying your understanding and enhancing your programming toolkit.</p></div>	\N	\N	2	f	2026-02-20 16:27:42.772572	\N
400	107	9	Error Handling and Exceptions	<div>In the world of programming, errors are inevitable. Whether they arise from user input, system failures, or logical mistakes, handling these errors gracefully is crucial for creating robust and user-friendly applications. This lesson focuses on 'Error Handling and Exceptions' in Python, an essential skill for any aspiring Python developer. <br></div><div><br></div><div>### Understanding Errors and Exceptions<br></div><div><br></div><div>Errors in Python can be broadly categorized into two types: syntax errors and exceptions. <br></div><div><br></div><div>1. **Syntax Errors**: These occur when the code does not conform to the syntax rules of the Python language. For example, forgetting a colon at the end of a function definition will raise a syntax error. <br></div><div>   <br></div><div>   ```python<br></div><div>   def my_function()<br></div><div>       print("Hello, World!")  # This will raise a SyntaxError<br></div><div>   ```<br></div><div><br></div><div>2. **Exceptions**: Unlike syntax errors, exceptions are raised during the execution of a program when the interpreter encounters a situation it cannot handle. Common exceptions include `ValueError`, `TypeError`, `IndexError`, and `ZeroDivisionError`. <br></div><div><br></div><div>### The Try-Except Block<br></div><div><br></div><div>To handle exceptions in Python, we use the `try` and `except` blocks. The code that may raise an exception is placed inside the `try` block, and the code that handles the exception is placed inside the `except` block. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    result = 10 / 0  # This will raise a ZeroDivisionError<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>In this example, when the division by zero occurs, the program does not crash; instead, it gracefully handles the error and prints a user-friendly message. <br></div><div><br></div><div>### Catching Multiple Exceptions<br></div><div><br></div><div>Sometimes, you may want to handle multiple exceptions that could arise from a block of code. You can do this by specifying multiple `except` clauses. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>### The Else and Finally Clauses<br></div><div><br></div><div>In addition to `try` and `except`, Python provides `else` and `finally` clauses to enhance error handling. The `else` block runs if the `try` block does not raise an exception, while the `finally` block always runs, regardless of whether an exception occurred. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>else:<br></div><div>    print(f"The result is {result}")<br></div><div>finally:<br></div><div>    print("Execution completed.")<br></div><div>```  <br></div><div><br></div><div>### Raising Exceptions<br></div><div><br></div><div>You can also raise exceptions intentionally using the `raise` statement. This is useful when you want to enforce certain conditions in your code. <br></div><div><br></div><div>```python<br></div><div>def check_positive(number):<br></div><div>    if number < 0:<br></div><div>        raise ValueError("Number must be positive!")<br></div><div>    return number<br></div><div>```  <br></div><div><br></div><div>### Custom Exception Classes<br></div><div><br></div><div>For more complex applications, you may want to define your own custom exceptions. This allows for more specific error handling tailored to your application's needs. <br></div><div><br></div><div>```python<br></div><div>class CustomError(Exception):<br></div><div>    pass<br></div><div><br></div><div>try:<br></div><div>    raise CustomError("This is a custom error message.")<br></div><div>except CustomError as e:<br></div><div>    print(e)<br></div><div>```  <br></div><div><br></div><div>### Conclusion<br></div><div><br></div><div>Error handling is a vital skill in Python programming. By mastering `try`, `except`, `else`, and `finally`, as well as understanding how to raise and define custom exceptions, you can create applications that are not only functional but also robust and user-friendly. This lesson lays the groundwork for effective error management, which will be crucial as you build real-world projects in this course.</div>	\N	\N	3	f	2026-02-20 16:27:42.776151	\N
401	107	9	Working with Libraries	<div>In this lesson, we will delve into the concept of libraries in Python, a fundamental aspect of programming that enhances productivity and code reusability. Libraries are collections of pre-written code that provide specific functionalities, allowing developers to leverage existing solutions instead of writing code from scratch. This lesson will cover the following key areas:<br></div><div><br></div><div>### 1. Understanding Libraries<br></div><div>Libraries in Python can be thought of as toolkits that provide a set of functions and methods to perform various tasks. They can be categorized into:<br></div><div>- **Standard Libraries**: These are included with Python and provide a wide range of functionalities, such as file I/O, system calls, and data manipulation.<br></div><div>- **Third-Party Libraries**: These are external packages created by the community or organizations that can be installed and used to extend Python's capabilities.<br></div><div><br></div><div>### 2. Why Use Libraries?<br></div><div>Using libraries offers several advantages:<br></div><div>- **Efficiency**: Libraries save time by providing ready-to-use code, allowing developers to focus on the unique aspects of their projects.<br></div><div>- **Reliability**: Well-maintained libraries are tested and widely used, reducing the likelihood of bugs in your code.<br></div><div>- **Community Support**: Many libraries have large communities that contribute to their development and provide support through documentation and forums.<br></div><div><br></div><div>### 3. How to Import Libraries<br></div><div>To use a library in your Python code, you need to import it. The basic syntax for importing a library is:<br></div><div>```python<br></div><div>import library_name<br></div><div>```<br></div><div>For example, to import the `math` library, you would write:<br></div><div>```python<br></div><div>import math<br></div><div>```<br></div><div>You can also import specific functions from a library:<br></div><div>```python<br></div><div>from library_name import function_name<br></div><div>```<br></div><div>This allows you to use the function directly without prefixing it with the library name.<br></div><div><br></div><div>### 4. Popular Python Libraries<br></div><div>Here are some widely-used libraries that you will encounter in your Python journey:<br></div><div>- **NumPy**: A library for numerical computations, particularly useful for handling arrays and matrices.<br></div><div>- **Pandas**: A data manipulation library that provides data structures like DataFrames for handling structured data.<br></div><div>- **Matplotlib**: A plotting library that allows you to create static, animated, and interactive visualizations in Python.<br></div><div>- **Requests**: A library for making HTTP requests, simplifying the process of working with APIs.<br></div><div><br></div><div>### 5. Installing Third-Party Libraries<br></div><div>To install third-party libraries, you can use `pip`, Python's package installer. The command to install a library is:<br></div><div>```bash<br></div><div>pip install library_name<br></div><div>```<br></div><div>For example, to install the Requests library, you would run:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div>Make sure to have a virtual environment set up to manage dependencies effectively.<br></div><div><br></div><div>### 6. Best Practices for Using Libraries<br></div><div>When working with libraries, consider the following best practices:<br></div><div>- **Read Documentation**: Familiarize yourself with the library's documentation to understand its features and usage.<br></div><div>- **Keep Libraries Updated**: Regularly update libraries to benefit from new features, improvements, and security patches.<br></div><div>- **Limit Dependencies**: Use only the libraries you need to keep your project lightweight and manageable.<br></div><div><br></div><div>### 7. Real-World Application<br></div><div>In the context of our course, you will apply your knowledge of libraries in the five real-world projects. For instance, when working on a data analysis project, you might use Pandas for data manipulation and Matplotlib for visualization. By leveraging libraries, you will be able to create robust and efficient solutions while enhancing your coding skills.<br></div><div><br></div><div>### Conclusion<br></div><div>Understanding and effectively using libraries is crucial for any Python developer. They not only streamline the coding process but also allow you to harness the collective knowledge of the programming community. As we progress through this course, you will gain hands-on experience with various libraries, enabling you to build sophisticated applications with ease.</div>	\N	\N	4	f	2026-02-20 16:27:42.780662	\N
402	108	9	Introduction to Pandas	<div>### Introduction to Pandas<br></div><div><br></div><div>Pandas is a powerful and versatile open-source data analysis and manipulation library for Python. It provides data structures and functions needed to work with structured data seamlessly. This lesson will introduce you to the core concepts of Pandas, its key features, and how to get started with data analysis using this library.<br></div><div><br></div><div>#### What is Pandas?<br></div><div>Pandas is built on top of NumPy and is designed for data manipulation and analysis. It offers two primary data structures:<br></div><div>- **Series**: A one-dimensional labeled array capable of holding any data type.<br></div><div>- **DataFrame**: A two-dimensional labeled data structure with columns of potentially different types. It is similar to a spreadsheet or SQL table.<br></div><div><br></div><div>#### Key Features of Pandas<br></div><div>1. **Data Alignment**: Pandas automatically aligns data based on labels, making it easy to work with data from different sources.<br></div><div>2. **Handling Missing Data**: Pandas provides robust tools for detecting, removing, and filling missing data, ensuring data integrity.<br></div><div>3. **Data Transformation**: With built-in functions, you can easily reshape, merge, and concatenate datasets.<br></div><div>4. **Time Series Analysis**: Pandas has extensive support for time series data, allowing for easy manipulation and analysis of date and time data.<br></div><div>5. **Data Visualization**: While Pandas itself is not a visualization library, it integrates well with libraries like Matplotlib and Seaborn, enabling effective data visualization.<br></div><div><br></div><div>#### Getting Started with Pandas<br></div><div>To begin using Pandas, you first need to install it. You can do this via pip:<br></div><div>```bash<br></div><div>pip install pandas<br></div><div>```<br></div><div><br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import pandas as pd<br></div><div>```<br></div><div><br></div><div>#### Creating a Series<br></div><div>A Series can be created from a list, dictionary, or NumPy array. Here’s how to create a simple Series:<br></div><div>```python<br></div><div># Creating a Series from a list<br></div><div>data = [10, 20, 30, 40]<br></div><div>series = pd.Series(data)<br></div><div>print(series)<br></div><div>```<br></div><div><br></div><div>#### Creating a DataFrame<br></div><div>A DataFrame can be created from various data sources, including dictionaries, lists, or external files like CSV. Here’s an example of creating a DataFrame from a dictionary:<br></div><div>```python<br></div><div># Creating a DataFrame from a dictionary<br></div><div>data = {<br></div><div>    'Name': ['Alice', 'Bob', 'Charlie'],<br></div><div>    'Age': [24, 30, 22],<br></div><div>    'City': ['New York', 'Los Angeles', 'Chicago']<br></div><div>}<br></div><div>df = pd.DataFrame(data)<br></div><div>print(df)<br></div><div>```<br></div><div><br></div><div>#### Basic DataFrame Operations<br></div><div>1. **Viewing Data**: Use `df.head()` to view the first few rows of the DataFrame.<br></div><div>2. **Descriptive Statistics**: Use `df.describe()` to get a summary of statistics for numerical columns.<br></div><div>3. **Indexing and Selecting Data**: Access rows and columns using `loc` and `iloc` methods.<br></div><div>4. **Filtering Data**: Use boolean indexing to filter data based on conditions.<br></div><div><br></div><div>#### Conclusion<br></div><div>Pandas is an essential tool for anyone working with data in Python. Its intuitive data structures and powerful functionalities make data manipulation straightforward and efficient. In the upcoming lessons, we will dive deeper into advanced features of Pandas, including data cleaning, merging datasets, and performing complex analyses. Get ready to harness the full power of data with Pandas!</div>	\N	\N	1	t	2026-02-20 16:27:42.788892	\N
403	108	9	Data Cleaning Techniques	<div>Data cleaning is a critical step in the data analysis process that ensures the accuracy and quality of your datasets. In this lesson, we will explore various data cleaning techniques that every data professional should master, particularly when working with Python. <br></div><div><br></div><div>### 1. Understanding Data Cleaning<br></div><div>Data cleaning, also known as data cleansing or data scrubbing, involves identifying and correcting errors or inconsistencies in data to improve its quality. This process can include handling missing values, removing duplicates, correcting data types, and addressing outliers. <br></div><div><br></div><div>### 2. Importance of Data Cleaning<br></div><div>- **Accuracy**: Clean data leads to more accurate analysis and insights. <br></div><div>- **Efficiency**: Well-prepared data reduces the time spent on analysis. <br></div><div>- **Decision Making**: High-quality data supports better decision-making in business contexts. <br></div><div><br></div><div>### 3. Common Data Cleaning Techniques<br></div><div>#### a. Handling Missing Values<br></div><div>   - **Removal**: Delete rows or columns with missing values if they are not significant. <br></div><div>   - **Imputation**: Replace missing values with statistical measures like mean, median, or mode. <br></div><div>   - **Interpolation**: Use methods like linear interpolation to estimate missing values based on surrounding data. <br></div><div><br></div><div>#### b. Removing Duplicates<br></div><div>   - Use the `drop_duplicates()` function in pandas to eliminate duplicate entries in your dataset. <br></div><div>   - Ensure that you identify which columns define a duplicate entry. <br></div><div><br></div><div>#### c. Correcting Data Types<br></div><div>   - Ensure that each column in your dataset has the correct data type (e.g., integers, floats, strings). <br></div><div>   - Use the `astype()` method in pandas to convert data types as necessary. <br></div><div><br></div><div>#### d. Outlier Detection and Treatment<br></div><div>   - Identify outliers using statistical methods (e.g., Z-score, IQR). <br></div><div>   - Decide whether to remove, transform, or keep outliers based on their impact on your analysis. <br></div><div><br></div><div>#### e. Standardizing Data<br></div><div>   - Ensure consistency in data formats (e.g., date formats, text casing). <br></div><div>   - Use string methods and regular expressions to clean and standardize text data. <br></div><div><br></div><div>### 4. Tools and Libraries for Data Cleaning in Python<br></div><div>- **Pandas**: The primary library for data manipulation and cleaning. <br></div><div>- **NumPy**: Useful for numerical operations and handling arrays. <br></div><div>- **OpenRefine**: A powerful tool for working with messy data and exploring large datasets. <br></div><div><br></div><div>### 5. Best Practices for Data Cleaning<br></div><div>- **Document Your Process**: Keep track of the cleaning steps you take for reproducibility. <br></div><div>- **Automate When Possible**: Use scripts to automate repetitive cleaning tasks. <br></div><div>- **Validate Your Data**: Always check the results of your cleaning process to ensure data integrity. <br></div><div><br></div><div>### 6. Conclusion<br></div><div>Mastering data cleaning techniques is essential for any data professional. By applying these techniques effectively, you can ensure that your datasets are reliable, which will ultimately lead to more accurate analyses and better-informed decisions. In the next lesson, we will dive into practical applications of these techniques through real-world projects.</div>	\N	\N	2	f	2026-02-20 16:27:42.795007	\N
404	108	9	Data Visualization with Matplotlib	<div>### Introduction to Data Visualization<br></div><div>Data visualization is a crucial aspect of data analysis that allows us to present data in a visual context, making it easier to identify patterns, trends, and insights. In this lesson, we will explore Matplotlib, a powerful Python library for creating static, animated, and interactive visualizations in Python.<br></div><div><br></div><div>### What is Matplotlib?<br></div><div>Matplotlib is one of the most widely used libraries for data visualization in Python. It provides a flexible and comprehensive framework for creating a variety of plots and charts. With Matplotlib, you can create line plots, scatter plots, bar charts, histograms, and much more.<br></div><div><br></div><div>### Getting Started with Matplotlib<br></div><div>To begin using Matplotlib, you first need to install it. You can do this using pip:<br></div><div>```bash<br></div><div>pip install matplotlib<br></div><div>```<br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>```<br></div><div><br></div><div>### Basic Plotting with Matplotlib<br></div><div>#### Line Plots<br></div><div>Line plots are one of the simplest forms of data visualization. They are ideal for showing trends over time. Here’s how to create a basic line plot:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>import numpy as np<br></div><div><br></div><div># Sample data<br></div><div>x = np.linspace(0, 10, 100)<br></div><div>y = np.sin(x)<br></div><div><br></div><div># Create a line plot<br></div><div>plt.plot(x, y)<br></div><div>plt.title('Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a sine wave, illustrating how to label axes and add a title.<br></div><div><br></div><div>#### Scatter Plots<br></div><div>Scatter plots are useful for showing the relationship between two variables. Here’s an example:<br></div><div>```python<br></div><div># Sample data<br></div><div>x = np.random.rand(50)<br></div><div>y = np.random.rand(50)<br></div><div><br></div><div># Create a scatter plot<br></div><div>plt.scatter(x, y, color='blue', alpha=0.5)<br></div><div>plt.title('Random Scatter Plot')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a scatter plot with random data points.<br></div><div><br></div><div>### Customizing Plots<br></div><div>Matplotlib allows extensive customization of your plots. You can change colors, line styles, markers, and much more. Here’s how to customize a line plot:<br></div><div>```python<br></div><div># Customizing a line plot<br></div><div>plt.plot(x, y, color='red', linestyle='--', linewidth=2, marker='o')<br></div><div>plt.title('Customized Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>### Subplots<br></div><div>You can create multiple plots in a single figure using subplots. This is useful for comparing different datasets:<br></div><div>```python<br></div><div>fig, axs = plt.subplots(2, 1)<br></div><div><br></div><div># First subplot<br></div><div>axs[0].plot(x, y, color='blue')<br></div><div>axs[0].set_title('Sine Wave')<br></div><div><br></div><div># Second subplot<br></div><div>axs[1].scatter(x, y, color='green')<br></div><div>axs[1].set_title('Random Scatter')<br></div><div><br></div><div>plt.tight_layout()<br></div><div>plt.show()<br></div><div>```<br></div><div>### Conclusion<br></div><div>In this lesson, we have covered the basics of data visualization using Matplotlib. You learned how to create line plots, scatter plots, customize visualizations, and use subplots. Mastering these skills will enable you to effectively communicate your data insights through compelling visual representations. In the next lesson, we will explore advanced visualization techniques and how to integrate Matplotlib with other libraries such as Pandas and Seaborn for enhanced data analysis.</div>	\N	\N	3	f	2026-02-20 16:27:42.799172	\N
405	108	9	Exploratory Data Analysis	<div>## Introduction to Exploratory Data Analysis (EDA)<br></div><div><br></div><div>Exploratory Data Analysis (EDA) is a critical step in the data analysis process, serving as a foundation for understanding the underlying patterns and structures within a dataset. It involves summarizing the main characteristics of the data, often using visual methods. EDA allows data scientists to formulate hypotheses, identify anomalies, and gain insights that inform further analysis or modeling.<br></div><div><br></div><div>## Objectives of EDA<br></div><div><br></div><div>1. **Understanding Data Distribution**: EDA helps in understanding how data is distributed, identifying skewness, kurtosis, and the presence of outliers.<br></div><div>2. **Identifying Relationships**: It aids in discovering relationships between variables, which can be crucial for predictive modeling.<br></div><div>3. **Detecting Anomalies**: EDA can reveal anomalies or outliers that may need to be addressed before further analysis.<br></div><div>4. **Formulating Hypotheses**: By visualizing data, analysts can generate hypotheses that can be tested with statistical methods.<br></div><div><br></div><div>## Key Techniques in EDA<br></div><div><br></div><div>### 1. Descriptive Statistics<br></div><div>Descriptive statistics provide a summary of the central tendency, dispersion, and shape of a dataset’s distribution. Key metrics include:<br></div><div>- **Mean**: Average value of the dataset.<br></div><div>- **Median**: The middle value when the data is sorted.<br></div><div>- **Mode**: The most frequently occurring value.<br></div><div>- **Standard Deviation**: Measures the amount of variation or dispersion in a set of values.<br></div><div><br></div><div>### 2. Data Visualization<br></div><div>Visualizing data is one of the most powerful tools in EDA. Common visualization techniques include:<br></div><div>- **Histograms**: Useful for understanding the distribution of a single variable.<br></div><div>- **Box Plots**: Effective for identifying outliers and understanding the spread of the data.<br></div><div>- **Scatter Plots**: Helpful for examining relationships between two continuous variables.<br></div><div>- **Heatmaps**: Useful for visualizing correlation matrices.<br></div><div><br></div><div>### 3. Correlation Analysis<br></div><div>Correlation analysis helps in identifying relationships between variables. The correlation coefficient (e.g., Pearson's r) quantifies the degree to which two variables are related. A heatmap can be a great visual tool to represent these correlations.<br></div><div><br></div><div>### 4. Handling Missing Values<br></div><div>Missing data can skew results and lead to incorrect conclusions. EDA should include strategies for handling missing values, such as:<br></div><div>- **Imputation**: Filling in missing values with the mean, median, or mode.<br></div><div>- **Deletion**: Removing records with missing values, if appropriate.<br></div><div><br></div><div>### 5. Outlier Detection<br></div><div>Outliers can significantly affect the results of data analysis. Techniques for detecting outliers include:<br></div><div>- **Z-Score Method**: Identifying data points that lie beyond a certain number of standard deviations from the mean.<br></div><div>- **IQR Method**: Using the interquartile range to identify outliers.<br></div><div><br></div><div>## Tools and Libraries for EDA in Python<br></div><div>Python offers a variety of libraries that facilitate EDA, including:<br></div><div>- **Pandas**: For data manipulation and analysis.<br></div><div>- **Matplotlib**: For creating static, interactive, and animated visualizations.<br></div><div>- **Seaborn**: Built on Matplotlib, it provides a high-level interface for drawing attractive statistical graphics.<br></div><div>- **NumPy**: For numerical operations and handling arrays.<br></div><div>- **Scikit-learn**: For implementing machine learning algorithms and preprocessing data.<br></div><div><br></div><div>## Conclusion<br></div><div>Exploratory Data Analysis is an indispensable part of the data science workflow. By employing EDA techniques, data scientists can uncover valuable insights that guide decision-making and model development. Mastering EDA in Python equips learners with the necessary skills to analyze real-world datasets effectively, paving the way for successful data-driven projects.<br></div><div><br></div><div>## Practical Application<br></div><div>In this course, you will engage in hands-on projects that will require you to apply EDA techniques to real-world datasets. This practical experience will reinforce your understanding and prepare you for data analysis tasks in professional settings.</div>	\N	\N	4	f	2026-02-20 16:27:42.804589	\N
406	109	9	Introduction to Flask	<div>Flask is a micro web framework written in Python that is designed to make web development simple and efficient. In this lesson, we will explore the fundamentals of Flask, its architecture, and how to set up your first web application. By the end of this lesson, you will have a solid understanding of how to create web applications using Flask, and you will be ready to dive deeper into more advanced topics.<br></div><div><br></div><div>### What is Flask?<br></div><div>Flask is a lightweight WSGI (Web Server Gateway Interface) web application framework that is easy to get started with and is flexible enough to scale up to complex applications. It was created by Armin Ronacher and is part of the Pallets Projects. Flask is often referred to as a micro-framework because it does not require particular tools or libraries, allowing developers to choose their components.<br></div><div><br></div><div>### Key Features of Flask<br></div><div>1. **Simplicity**: Flask is designed to be easy to use and learn, making it an excellent choice for beginners.<br></div><div>2. **Flexibility**: Unlike some other frameworks, Flask does not impose a specific structure, allowing developers to organize their projects as they see fit.<br></div><div>3. **Built-in Development Server**: Flask includes a built-in server for development purposes, which makes it easy to test your applications locally.<br></div><div>4. **Jinja2 Templating**: Flask uses Jinja2 for templating, allowing you to create dynamic HTML pages easily.<br></div><div>5. **RESTful Request Dispatching**: Flask supports RESTful request dispatching, making it a great choice for building APIs.<br></div><div><br></div><div>### Setting Up Flask<br></div><div>To get started with Flask, you need to have Python installed on your machine. Follow these steps to set up Flask:<br></div><div>1. **Install Flask**: You can install Flask using pip, the Python package manager. Open your terminal and run:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. **Create a Project Directory**: Create a new directory for your Flask project. For example:<br></div><div>   ```bash<br></div><div>   mkdir my_flask_app<br></div><div>   cd my_flask_app<br></div><div>   ```<br></div><div>3. **Create a Basic Flask Application**: Create a new Python file, `app.py`, and add the following code:<br></div><div>   ```python<br></div><div>   from flask import Flask<br></div><div>   app = Flask(__name__)<br></div><div><br></div><div>   @app.route('/')  # This is the home route<br></div><div>   def home():<br></div><div>       return 'Hello, Flask!'<br></div><div><br></div><div>   if __name__ == '__main__':<br></div><div>       app.run(debug=True)<br></div><div>   ```<br></div><div>4. **Run Your Application**: In your terminal, run the application by executing:<br></div><div>   ```bash<br></div><div>   python app.py<br></div><div>   ```<br></div><div>   You should see output indicating that the server is running. Open your web browser and go to `http://127.0.0.1:5000/` to see your Flask app in action.<br></div><div><br></div><div>### Understanding Flask Routing<br></div><div>Routing is a crucial concept in Flask that allows you to define the URL structure of your web application. In the example above, we defined a route using the `@app.route('/')` decorator. This tells Flask to execute the `home` function when the root URL is accessed. You can create additional routes by adding more decorators:<br></div><div>```python<br></div><div>@app.route('/about')<br></div><div>def about():<br></div><div>    return 'About Page'<br></div><div>```<br></div><div><br></div><div>### Flask Templates<br></div><div>Flask supports templates, which allow you to separate your HTML from your Python code. Create a new directory called `templates` in your project folder and add an HTML file, `index.html`:<br></div><div>```html<br></div><div><!DOCTYPE html><br></div><div><html><br></div><div><head><br></div><div>    <title>My Flask App</title><br></div><div></head><br></div><div><body><br></div><div>    <h1>{{ title }}</h1><br></div><div>    <p>Welcome to my Flask application!</p><br></div><div></body><br></div><div></html><br></div><div>```<br></div><div>You can render this template in your Flask app using:<br></div><div>```python<br></div><div>from flask import render_template<br></div><div><br></div><div>@app.route('/')<br></div><div>def home():<br></div><div>    return render_template('index.html', title='Home')<br></div><div>```<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we introduced Flask and its core features. You learned how to set up a basic Flask application, define routes, and use templates to create dynamic content. Flask's simplicity and flexibility make it an excellent choice for both beginners and experienced developers looking to build web applications quickly. In the upcoming lessons, we will explore more advanced concepts, such as working with databases, user authentication, and deploying your Flask applications. Get ready to take your Python skills to the next level!</div>	\N	\N	1	t	2026-02-20 16:27:42.810458	\N
407	109	9	Building RESTful APIs	<div>## Introduction to RESTful APIs<br></div><div><br></div><div>In the modern web development landscape, RESTful APIs (Representational State Transfer) have become a cornerstone for building scalable and efficient applications. They allow different software systems to communicate over HTTP using standard methods. This lesson will guide you through the principles of RESTful APIs, their components, and how to build one using Python.<br></div><div><br></div><div>## What is REST?<br></div><div><br></div><div>REST is an architectural style that defines a set of constraints and properties based on HTTP. It emphasizes stateless communication, where each request from a client contains all the information needed to process the request. RESTful APIs are designed around resources, which are identified by URLs. <br></div><div><br></div><div>### Key Principles of REST<br></div><div>1. **Statelessness**: Each request is independent, and the server does not store client context between requests.<br></div><div>2. **Client-Server Architecture**: The client and server are separate entities that communicate over HTTP, allowing for separation of concerns.<br></div><div>3. **Cacheability**: Responses must define themselves as cacheable or non-cacheable to improve performance.<br></div><div>4. **Uniform Interface**: A standardized way of interacting with resources, typically using standard HTTP methods like GET, POST, PUT, DELETE.<br></div><div>5. **Layered System**: The architecture can consist of multiple layers, with each layer having specific responsibilities.<br></div><div><br></div><div>## Components of a RESTful API<br></div><div><br></div><div>### Resources<br></div><div>Resources are the key components of a RESTful API. They represent data entities and are typically accessed via unique URLs. For example, in a bookstore API, resources could include `/books`, `/authors`, and `/genres`.<br></div><div><br></div><div>### HTTP Methods<br></div><div>RESTful APIs utilize standard HTTP methods to perform operations on resources:<br></div><div>- **GET**: Retrieve data from the server (e.g., get a list of books).<br></div><div>- **POST**: Create a new resource (e.g., add a new book).<br></div><div>- **PUT**: Update an existing resource (e.g., update book details).<br></div><div>- **DELETE**: Remove a resource (e.g., delete a book).<br></div><div><br></div><div>### Status Codes<br></div><div>HTTP status codes provide feedback about the outcome of API requests. Commonly used status codes include:<br></div><div>- **200 OK**: The request was successful.<br></div><div>- **201 Created**: A resource was successfully created.<br></div><div>- **204 No Content**: The request was successful, but there is no content to return.<br></div><div>- **400 Bad Request**: The server could not understand the request due to invalid syntax.<br></div><div>- **404 Not Found**: The requested resource could not be found.<br></div><div>- **500 Internal Server Error**: The server encountered an unexpected condition.<br></div><div><br></div><div>## Building a RESTful API with Python<br></div><div><br></div><div>In this section, we will build a simple RESTful API using Flask, a lightweight web framework for Python.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>1. Install Flask:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. Create a new Python file (e.g., `app.py`).<br></div><div><br></div><div>### Step 2: Creating the Flask Application<br></div><div>```python<br></div><div>from flask import Flask, jsonify, request<br></div><div><br></div><div>app = Flask(__name__)<br></div><div><br></div><div># Sample data<br></div><div>books = [<br></div><div>    {'id': 1, 'title': '1984', 'author': 'George Orwell'},<br></div><div>    {'id': 2, 'title': 'To Kill a Mockingbird', 'author': 'Harper Lee'}<br></div><div>]<br></div><div><br></div><div>@app.route('/books', methods=['GET'])<br></div><div>def get_books():<br></div><div>    return jsonify(books)<br></div><div><br></div><div>if __name__ == '__main__':<br></div><div>    app.run(debug=True)<br></div><div>```<br></div><div><br></div><div>### Step 3: Running the API<br></div><div>Run the application with:<br></div><div>```bash<br></div><div>python app.py<br></div><div>```<br></div><div>Visit `http://127.0.0.1:5000/books` in your browser or use a tool like Postman to see the JSON response of the book list.<br></div><div><br></div><div>### Step 4: Implementing CRUD Operations<br></div><div>Expand the API to include POST, PUT, and DELETE methods:<br></div><div>- **POST**: Add a new book.<br></div><div>- **PUT**: Update an existing book by ID.<br></div><div>- **DELETE**: Remove a book by ID.<br></div><div><br></div><div>### Example Code for CRUD Operations<br></div><div>```python<br></div><div>@app.route('/books', methods=['POST'])<br></div><div>def add_book():<br></div><div>    new_book = request.get_json()<br></div><div>    books.append(new_book)<br></div><div>    return jsonify(new_book), 201<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['PUT'])<br></div><div>def update_book(book_id):<br></div><div>    book = next((b for b in books if b['id'] == book_id), None)<br></div><div>    if book:<br></div><div>        data = request.get_json()<br></div><div>        book.update(data)<br></div><div>        return jsonify(book)<br></div><div>    return jsonify({'error': 'Book not found'}), 404<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['DELETE'])<br></div><div>def delete_book(book_id):<br></div><div>    global books<br></div><div>    books = [b for b in books if b['id'] != book_id]<br></div><div>    return jsonify({'result': True})<br></div><div>```<br></div><div><br></div><div>## Conclusion<br></div><div><br></div><div>Building RESTful APIs is an essential skill for Python developers. By understanding the principles of REST and implementing a simple API using Flask, you can create robust applications that facilitate communication between different systems. In this lesson, you learned about the core concepts of RESTful APIs, their components, and how to implement CRUD operations. This foundational knowledge will serve you well as you tackle more complex projects in your journey to mastering Python.</div>	\N	\N	2	f	2026-02-20 16:27:42.813715	\N
408	109	9	Database Integration	<div>In this lesson on Database Integration, we will explore the essential concepts and practical applications of integrating databases with Python. This is a crucial skill for any developer, especially those looking to build robust applications that manage and manipulate data efficiently.<br></div><div><br></div><div>### 1. Understanding Databases<br></div><div>Databases are structured collections of data that allow for efficient storage, retrieval, and management. There are various types of databases, including:<br></div><div>- **Relational Databases** (e.g., MySQL, PostgreSQL): These use structured query language (SQL) for defining and manipulating data.<br></div><div>- **NoSQL Databases** (e.g., MongoDB, Cassandra): These are designed for unstructured data and provide flexibility in data modeling.<br></div><div><br></div><div>### 2. Why Integrate Databases with Python?<br></div><div>Python is a versatile programming language that provides numerous libraries and frameworks for database integration. The benefits include:<br></div><div>- **Ease of Use**: Python’s syntax is clean and easy to understand, making it simple to write database queries and handle data.<br></div><div>- **Rich Ecosystem**: With libraries like SQLAlchemy, Django ORM, and PyMongo, Python can interact with various database systems seamlessly.<br></div><div>- **Data Manipulation**: Python excels at data manipulation and analysis, making it a perfect companion for databases.<br></div><div><br></div><div>### 3. Setting Up Your Environment<br></div><div>Before diving into database integration, ensure you have the following tools installed:<br></div><div>- **Python**: Ensure you have Python 3.x installed on your system.<br></div><div>- **Database**: Install a relational database like MySQL or a NoSQL database like MongoDB.<br></div><div>- **Libraries**: Install necessary libraries using pip. For example, for MySQL, you would use:<br></div><div>  ```bash<br></div><div>  pip install mysql-connector-python<br></div><div>  ```<br></div><div><br></div><div>### 4. Connecting to a Database<br></div><div>To connect to a database, you need to establish a connection using Python. Here’s a basic example using MySQL:<br></div><div>```python<br></div><div>import mysql.connector<br></div><div><br></div><div># Establishing a connection<br></div><div>connection = mysql.connector.connect(<br></div><div>    host='localhost',<br></div><div>    user='your_username',<br></div><div>    password='your_password',<br></div><div>    database='your_database'<br></div><div>)<br></div><div><br></div><div># Checking the connection<br></div><div>if connection.is_connected():<br></div><div>    print('Connected to the database')<br></div><div>```<br></div><div><br></div><div>### 5. Executing Queries<br></div><div>Once connected, you can execute SQL queries to interact with the database. Here’s how to create a table and insert data:<br></div><div>```python<br></div><div>cursor = connection.cursor()<br></div><div><br></div><div># Creating a table<br></div><div>create_table_query = '''CREATE TABLE users (<br></div><div>    id INT AUTO_INCREMENT PRIMARY KEY,<br></div><div>    name VARCHAR(255) NOT NULL,<br></div><div>    email VARCHAR(255) NOT NULL UNIQUE<br></div><div>)'''  <br></div><div>cursor.execute(create_table_query)<br></div><div><br></div><div># Inserting data<br></div><div>insert_query = "INSERT INTO users (name, email) VALUES (%s, %s)"<br></div><div>user_data = ('John Doe', 'john@example.com')<br></div><div>cursor.execute(insert_query, user_data)<br></div><div>connection.commit()<br></div><div><br></div><div>print('Data inserted successfully')<br></div><div>```<br></div><div><br></div><div>### 6. Retrieving Data<br></div><div>Retrieving data from the database is straightforward. You can use SELECT queries to fetch data:<br></div><div>```python<br></div><div># Retrieving data<br></div><div>select_query = "SELECT * FROM users"<br></div><div>cursor.execute(select_query)<br></div><div>result = cursor.fetchall()<br></div><div><br></div><div>for row in result:<br></div><div>    print(row)<br></div><div>```<br></div><div><br></div><div>### 7. Closing the Connection<br></div><div>Always remember to close the connection to the database once your operations are complete:<br></div><div>```python<br></div><div>cursor.close()<br></div><div>connection.close()<br></div><div>```<br></div><div><br></div><div>### 8. Best Practices<br></div><div>- **Use Parameterized Queries**: Prevent SQL injection attacks by using parameterized queries instead of string concatenation.<br></div><div>- **Error Handling**: Implement error handling using try-except blocks to manage exceptions gracefully.<br></div><div>- **Connection Pooling**: For applications with high database traffic, consider using connection pooling for efficiency.<br></div><div><br></div><div>### 9. Real-World Project Example<br></div><div>In your upcoming real-world project, you will integrate a database with a Python web application. You will:<br></div><div>- Design a database schema for user management.<br></div><div>- Implement CRUD (Create, Read, Update, Delete) operations.<br></div><div>- Use an ORM for easier data manipulation.<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we covered the fundamental aspects of database integration using Python. Mastering these concepts will empower you to build data-driven applications and enhance your programming skills. In the next lesson, we will dive deeper into advanced database management techniques and explore how to optimize database performance.</div>	\N	\N	3	f	2026-02-20 16:27:42.816743	\N
409	109	9	Deploying Web Applications	<div><h1>Deploying Web Applications</h1><br></div><div><p>In the final lesson of our course, 'Masters in Python with 5 Real-World Projects', we delve into the crucial topic of deploying web applications. Deployment is the process of making your web application accessible to users over the internet. This lesson will guide you through the various methods, tools, and best practices for deploying Python web applications effectively.</p><br></div><div><br></div><div><h2>1. Understanding Deployment</h2><br></div><div><p>Deployment involves several steps, including preparing your application, choosing a hosting environment, and ensuring that your application runs smoothly in a production setting. It’s essential to understand that deployment is not just a one-time event; it requires ongoing maintenance and updates.</p><br></div><div><br></div><div><h2>2. Preparing Your Application for Deployment</h2><br></div><div><p>Before deploying, ensure that your application is production-ready. This includes:</p><br></div><div><ul><br></div><div>  <li><strong>Code Optimization:</strong> Refactor your code for performance, remove debug statements, and ensure that your code adheres to best practices.</li><br></div><div>  <li><strong>Configuration Management:</strong> Separate configuration settings (like database credentials) from your codebase using environment variables or configuration files.</li><br></div><div>  <li><strong>Testing:</strong> Conduct thorough testing, including unit tests, integration tests, and user acceptance testing to ensure your application behaves as expected.</li><br></div><div></ul><br></div><div><br></div><div><h2>3. Choosing a Hosting Environment</h2><br></div><div><p>There are several options for hosting your web application:</p><br></div><div><ul><br></div><div>  <li><strong>Shared Hosting:</strong> Cost-effective but limited in resources and control. Suitable for small applications.</li><br></div><div>  <li><strong>Virtual Private Servers (VPS):</strong> Offers more control and resources than shared hosting, allowing you to install custom software.</li><br></div><div>  <li><strong>Cloud Hosting:</strong> Services like AWS, Google Cloud, and Azure provide scalable resources and flexibility, ideal for growing applications.</li><br></div><div>  <li><strong>Platform as a Service (PaaS):</strong> Solutions like Heroku and PythonAnywhere simplify deployment by managing the infrastructure for you.</li><br></div><div></ul><br></div><div><br></div><div><h2>4. Deployment Tools and Technologies</h2><br></div><div><p>Utilizing the right tools can streamline your deployment process. Here are some popular options:</p><br></div><div><ul><br></div><div>  <li><strong>Docker:</strong> Containerization allows you to package your application with all its dependencies, ensuring consistency across different environments.</li><br></div><div>  <li><strong>Continuous Integration/Continuous Deployment (CI/CD):</strong> Tools like Jenkins, GitHub Actions, and Travis CI automate the testing and deployment process, reducing the chances of human error.</li><br></div><div>  <li><strong>Web Servers:</strong> Familiarize yourself with web servers like Nginx and Apache, which serve your application to users.</li><br></div><div></ul><br></div><div><br></div><div><h2>5. Best Practices for Deployment</h2><br></div><div><p>To ensure a successful deployment, adhere to these best practices:</p><br></div><div><ul><br></div><div>  <li><strong>Version Control:</strong> Use Git to manage your codebase, enabling you to track changes and collaborate effectively.</li><br></div><div>  <li><strong>Monitoring and Logging:</strong> Implement monitoring tools (like New Relic or Sentry) and logging practices to track your application’s performance and catch issues early.</li><br></div><div>  <li><strong>Backup and Recovery:</strong> Regularly back up your data and have a recovery plan in place to minimize downtime in case of failure.</li><br></div><div></ul><br></div><div><br></div><div><h2>6. Conclusion</h2><br></div><div><p>Deploying web applications is a vital skill for any Python developer. By understanding the deployment process, preparing your application, choosing the right hosting environment, utilizing effective tools, and following best practices, you can ensure that your web application is robust, scalable, and ready for users. As you embark on your deployment journey, remember that continuous learning and adaptation are key to mastering this essential aspect of web development.</p><br></div><div><br></div><div><p>In the next section, we will explore hands-on deployment exercises using popular platforms, allowing you to apply what you’ve learned in this lesson.</p></div>	\N	\N	4	f	2026-02-20 16:27:42.820921	\N
410	110	9	Project 1: Personal Finance Tracker	<div>### Introduction to Personal Finance Tracker<br></div><div>In today's fast-paced world, managing personal finances is crucial for achieving financial stability and success. This lesson focuses on creating a Personal Finance Tracker using Python, which will help you understand your income, expenses, savings, and investments better. By the end of this project, you will have a functional application that can assist you in making informed financial decisions.<br></div><div><br></div><div>### Project Overview<br></div><div>The Personal Finance Tracker will be a console-based application that allows users to:<br></div><div>1. **Track Income**: Users can input their sources of income and the amounts received.<br></div><div>2. **Record Expenses**: Users can categorize and record their expenses, helping them understand where their money goes.<br></div><div>3. **View Reports**: The application will generate reports that summarize income, expenses, and savings over a specified period.<br></div><div>4. **Set Budgets**: Users can set monthly budgets for different categories and receive alerts when they are nearing their limits.<br></div><div><br></div><div>### Learning Objectives<br></div><div>By completing this project, you will learn to:<br></div><div>- Use Python to create a command-line interface (CLI) application.<br></div><div>- Work with data structures like lists and dictionaries to manage financial data.<br></div><div>- Implement basic file handling to save and load user data.<br></div><div>- Utilize functions and modules to organize your code effectively.<br></div><div>- Gain insights into personal finance management and budgeting strategies.<br></div><div><br></div><div>### Step-by-Step Implementation<br></div><div>#### Step 1: Setting Up Your Environment<br></div><div>Before you start coding, ensure you have Python installed on your machine. You can download it from the official Python website. Additionally, you may want to use an Integrated Development Environment (IDE) like PyCharm or Visual Studio Code for better code management.<br></div><div><br></div><div>#### Step 2: Designing the Application<br></div><div>- **Define the Data Model**: Decide how you will structure your data. A simple approach could be:<br></div><div>  - `income`: A list of dictionaries, each containing `source` and `amount`.<br></div><div>  - `expenses`: A list of dictionaries, each containing `category`, `description`, and `amount`.<br></div><div>  - `budget`: A dictionary mapping categories to budget limits.<br></div><div><br></div><div>- **User Interface**: Plan how users will interact with your application. A simple text-based menu can be effective:<br></div><div>  - 1. Add Income<br></div><div>  - 2. Add Expense<br></div><div>  - 3. View Reports<br></div><div>  - 4. Set Budget<br></div><div>  - 5. Exit<br></div><div><br></div><div>#### Step 3: Implementing Functionality<br></div><div>- **Add Income**: Create a function that prompts the user for income details and appends them to the income list.<br></div><div>- **Add Expense**: Similar to income, create a function to record expenses.<br></div><div>- **Generate Reports**: Implement a function that calculates total income, total expenses, and savings, and displays them in a user-friendly format.<br></div><div>- **Set Budget**: Allow users to input budget limits for different categories and check against expenses.<br></div><div><br></div><div>#### Step 4: File Handling<br></div><div>To ensure user data is preserved between sessions, implement file handling:<br></div><div>- Use the `json` module to save income and expense data to a JSON file.<br></div><div>- Load this data when the application starts, allowing users to continue from where they left off.<br></div><div><br></div><div>#### Step 5: Testing and Debugging<br></div><div>Once your application is built, thoroughly test it to ensure all functionalities work as expected. Look for edge cases, such as negative income or expenses, and handle them appropriately.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing the Personal Finance Tracker project, you will not only enhance your Python programming skills but also gain valuable insights into managing your finances effectively. This project serves as a practical application of programming concepts while addressing a real-world need. As you progress through the course, remember that the skills you acquire here will be applicable in various domains, making you a versatile Python developer.<br></div><div><br></div><div>### Next Steps<br></div><div>After finishing this project, consider enhancing your tracker by adding features such as:<br></div><div>- Graphical user interface (GUI) using libraries like Tkinter or PyQt.<br></div><div>- Integration with online banking APIs for automatic transaction updates.<br></div><div>- Data visualization tools to represent financial data graphically.<br></div><div><br></div><div>Happy coding and good luck with your financial journey!</div>	\N	\N	1	t	2026-02-20 16:27:42.828857	\N
411	110	9	Project 2: Weather Forecast App	<div>In this lesson, we will embark on an exciting journey to create a Weather Forecast App using Python. This project is designed to deepen your understanding of Python programming while applying real-world concepts such as API integration, data handling, and user interface design. By the end of this project, you will have a fully functional application that retrieves and displays weather information based on user input.<br></div><div><br></div><div>### Objectives<br></div><div>- Understand how to interact with APIs to fetch real-time data.<br></div><div>- Learn to parse JSON data and extract relevant information.<br></div><div>- Develop a user-friendly interface using Python libraries.<br></div><div>- Implement error handling to manage API response issues.<br></div><div><br></div><div>### Project Overview<br></div><div>The Weather Forecast App will allow users to enter a city name and receive current weather conditions, including temperature, humidity, and a brief description of the weather. We will utilize the OpenWeatherMap API, which provides comprehensive weather data in a structured format.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>Before we start coding, ensure you have the following installed:<br></div><div>- Python 3.x<br></div><div>- Requests library (for API calls)<br></div><div>- Tkinter (for GUI development)<br></div><div><br></div><div>You can install the Requests library using pip:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div><br></div><div>### Step 2: API Key Registration<br></div><div>1. Visit the [OpenWeatherMap website](https://openweathermap.org/api) and sign up for a free account.<br></div><div>2. Once registered, navigate to the API section and generate your API key. This key will be used to authenticate your requests.<br></div><div><br></div><div>### Step 3: Fetching Weather Data<br></div><div>Using the Requests library, we will make a GET request to the OpenWeatherMap API to retrieve weather data. Here’s a basic example:<br></div><div>```python<br></div><div>import requests<br></div><div><br></div><div>API_KEY = 'your_api_key'<br></div><div>BASE_URL = 'http://api.openweathermap.org/data/2.5/weather'<br></div><div><br></div><div>city_name = input('Enter city name: ')<br></div><div>complete_url = f'{BASE_URL}?q={city_name}&appid={API_KEY}&units=metric'<br></div><div><br></div><div>response = requests.get(complete_url)<br></div><div><br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    # Process the data<br></div><div>else:<br></div><div>    print('City not found')<br></div><div>```<br></div><div>In this code snippet, we construct the API URL with the user-provided city name and our API key. We then check if the response is successful and parse the JSON data.<br></div><div><br></div><div>### Step 4: Parsing the JSON Response<br></div><div>Once we receive the response, we need to extract relevant information. The JSON response contains various fields, but we are primarily interested in:<br></div><div>- Temperature<br></div><div>- Weather description<br></div><div>- Humidity<br></div><div><br></div><div>Here’s how we can extract this information:<br></div><div>```python<br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    main = data['main']<br></div><div>    weather = data['weather'][0]<br></div><div>    temperature = main['temp']<br></div><div>    humidity = main['humidity']<br></div><div>    weather_description = weather['description']<br></div><div>    print(f'Temperature: {temperature}°C')<br></div><div>    print(f'Humidity: {humidity}%')<br></div><div>    print(f'Weather: {weather_description}')<br></div><div>```<br></div><div>### Step 5: Building the User Interface<br></div><div>Now that we can fetch and display weather data in the console, let’s create a graphical user interface (GUI) using Tkinter. Here’s a simple example to get you started:<br></div><div>```python<br></div><div>import tkinter as tk<br></div><div><br></div><div>def get_weather():<br></div><div>    # Fetch weather data and update the label<br></div><div>    pass<br></div><div><br></div><div>root = tk.Tk()<br></div><div>root.title('Weather Forecast App')<br></div><div><br></div><div>city_label = tk.Label(root, text='Enter city name:')<br></div><div>city_label.pack()<br></div><div><br></div><div>city_entry = tk.Entry(root)<br></div><div>city_entry.pack()<br></div><div><br></div><div>get_button = tk.Button(root, text='Get Weather', command=get_weather)<br></div><div>get_button.pack()<br></div><div><br></div><div>weather_info = tk.Label(root, text='Weather info will be displayed here')<br></div><div>weather_info.pack()<br></div><div><br></div><div>root.mainloop()<br></div><div>```<br></div><div>This code creates a simple window with an entry box for the city name, a button to fetch the weather, and a label to display the results.<br></div><div><br></div><div>### Step 6: Error Handling<br></div><div>To ensure a smooth user experience, implement error handling. If the API returns an error (e.g., city not found), display an appropriate message in the GUI instead of crashing the app.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this project, you will have gained practical experience in API usage, data parsing, and GUI development in Python. This Weather Forecast App not only showcases your programming skills but also serves as a foundation for more complex applications in the future. Remember to explore additional features, such as a forecast for multiple days or integrating maps to enhance your app further. Happy coding!</div>	\N	\N	2	f	2026-02-20 16:27:42.832514	\N
412	110	9	Project 3: Blog Platform	<div><h1>Project 3: Blog Platform</h1><br></div><div><p>Welcome to Project 3 of the <strong>Masters in Python with 5 Real-World Projects</strong>. In this project, you will design and implement a fully functional blog platform using Python. This project will help you solidify your understanding of web development concepts, database management, and the MVC (Model-View-Controller) architecture.</p><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The goal of this project is to create a blog platform where users can create, edit, delete, and view blog posts. You will also implement user authentication to manage user accounts, allowing for a personalized experience. By the end of this project, you will have a robust understanding of how to build web applications using Python frameworks.</p><br></div><div><br></div><div><h2>Key Features</h2><br></div><div><ul><br></div><div>  <li><strong>User Authentication:</strong> Implement sign-up, login, and logout functionality.</li><br></div><div>  <li><strong>CRUD Operations:</strong> Allow users to Create, Read, Update, and Delete blog posts.</li><br></div><div>  <li><strong>Commenting System:</strong> Enable users to comment on blog posts.</li><br></div><div>  <li><strong>Responsive Design:</strong> Ensure the platform is mobile-friendly and accessible.</li><br></div><div>  <li><strong>Search Functionality:</strong> Allow users to search for blog posts by title or content.</li><br></div><div></ul><br></div><div><br></div><div><h2>Technologies Used</h2><br></div><div><p>This project will utilize several technologies, including:</p><br></div><div><ul><br></div><div>  <li><strong>Python:</strong> The primary programming language for backend development.</li><br></div><div>  <li><strong>Flask or Django:</strong> A web framework to facilitate the development of the web application.</li><br></div><div>  <li><strong>SQLite or PostgreSQL:</strong> A database to store user and blog post data.</li><br></div><div>  <li><strong>HTML/CSS/JavaScript:</strong> For frontend development and creating a user-friendly interface.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Steps</h2><br></div><div><ol><br></div><div>  <li><strong>Set Up Your Environment:</strong> Install the necessary tools and libraries (Flask/Django, database connectors, etc.).</li><br></div><div>  <li><strong>Create the Database:</strong> Design the database schema to store users, posts, and comments.</li><br></div><div>  <li><strong>Implement User Authentication:</strong> Use libraries like Flask-Login or Django's built-in authentication to manage user sessions.</li><br></div><div>  <li><strong>Develop CRUD Functionality:</strong> Create routes and views for adding, editing, and deleting posts.</li><br></div><div>  <li><strong>Add Commenting System:</strong> Allow users to leave comments on blog posts and manage them.</li><br></div><div>  <li><strong>Design the User Interface:</strong> Use HTML and CSS to create a clean and engaging layout.</li><br></div><div>  <li><strong>Test the Application:</strong> Perform thorough testing to ensure all features work as intended.</li><br></div><div>  <li><strong>Deploy the Application:</strong> Use platforms like Heroku or DigitalOcean to host your blog platform.</li><br></div><div></ol><br></div><div><br></div><div><h2>Learning Outcomes</h2><br></div><div><p>Upon completing this project, you will have gained:</p><br></div><div><ul><br></div><div>  <li>A strong understanding of web application architecture.</li><br></div><div>  <li>Experience with user authentication and session management.</li><br></div><div>  <li>Skills in database design and management.</li><br></div><div>  <li>Proficiency in frontend and backend integration.</li><br></div><div>  <li>Knowledge of deploying web applications to cloud platforms.</li><br></div><div></ul><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>This blog platform project is a significant step in your journey to mastering Python and web development. It combines various essential skills and concepts that are critical for building real-world applications. Embrace the challenges, and enjoy the process of creating your own blog platform!</p></div>	\N	\N	3	f	2026-02-20 16:27:42.835209	\N
413	110	9	Project 4: E-commerce Website	<div>In this lesson, we will delve into Project 4 of the 'Masters in Python with 5 Real-World Projects' course, where you will create a fully functional e-commerce website. This project is designed to consolidate your Python skills while providing you with hands-on experience in web development. <br></div><div><br></div><div>### Introduction to E-commerce Websites<br></div><div>E-commerce websites facilitate online buying and selling of products and services. They are essential in today's digital economy, providing businesses with a platform to reach a global audience. In this project, you will learn how to build a robust e-commerce site using Python, Flask, and various other technologies.<br></div><div><br></div><div>### Objectives of the Project<br></div><div>By the end of this project, you will be able to:<br></div><div>1. **Understand the architecture of an e-commerce website**: Learn about the front-end and back-end components, including user interfaces, databases, and server-side logic.<br></div><div>2. **Implement user authentication**: Create secure login and registration systems for customers.<br></div><div>3. **Design a product catalog**: Build a dynamic catalog where users can browse products, filter by categories, and view detailed product information.<br></div><div>4. **Integrate a shopping cart**: Allow users to add, remove, and modify items in their shopping cart.<br></div><div>5. **Process payments securely**: Implement payment processing using APIs such as Stripe or PayPal.<br></div><div>6. **Deploy your website**: Learn how to host your e-commerce site on a cloud platform.<br></div><div><br></div><div>### Tools and Technologies Used<br></div><div>- **Python**: The primary programming language for backend development.<br></div><div>- **Flask**: A lightweight web framework that allows you to build web applications quickly.<br></div><div>- **HTML/CSS**: For structuring and styling the front-end of your website.<br></div><div>- **JavaScript**: To enhance user experience with interactive features.<br></div><div>- **SQLAlchemy**: For database management and ORM (Object Relational Mapping).<br></div><div>- **Bootstrap**: A front-end framework to design responsive web pages.<br></div><div>- **Stripe/PayPal API**: For secure payment processing.<br></div><div><br></div><div>### Project Structure<br></div><div>1. **Setting Up Your Environment**: Start by setting up a virtual environment and installing necessary libraries. Create a project folder structure that separates your static files, templates, and application logic.<br></div><div>2. **Creating the Database**: Use SQLAlchemy to define your database models for users, products, and orders. Establish relationships between these models to ensure data integrity.<br></div><div>3. **Building the Backend**: Develop the backend logic using Flask. Implement routes for user registration, login, product listing, and cart management. Ensure to handle errors and exceptions gracefully.<br></div><div>4. **Designing the Frontend**: Use HTML, CSS, and Bootstrap to create a user-friendly interface. Design pages for product listings, product details, cart, and checkout.<br></div><div>5. **Implementing User Authentication**: Use Flask-Login for managing user sessions and protecting routes that require authentication.<br></div><div>6. **Integrating Payment Processing**: Follow the documentation of your chosen payment processor to set up secure payment handling. Ensure to test transactions in a sandbox environment before going live.<br></div><div>7. **Testing Your Application**: Conduct thorough testing to identify and fix bugs. Consider both unit tests for individual components and integration tests for the entire application.<br></div><div>8. **Deployment**: Choose a cloud service provider (like Heroku, AWS, or DigitalOcean) to deploy your application. Ensure you configure the environment variables and database settings correctly.<br></div><div><br></div><div>### Conclusion<br></div><div>Completing this project will not only enhance your Python skills but will also give you a valuable portfolio piece that demonstrates your ability to build real-world applications. E-commerce is a booming field, and having practical experience in creating an e-commerce website will open doors for various career opportunities in web development and software engineering.<br></div><div><br></div><div>### Next Steps<br></div><div>As you embark on this project, remember to break it down into manageable tasks and set milestones to track your progress. Join forums or study groups to discuss challenges and share insights. Good luck, and enjoy the process of bringing your e-commerce vision to life!</div>	\N	\N	4	f	2026-02-20 16:27:42.838169	\N
414	110	9	Project 5: Data Analysis Dashboard	<div><h1>Project 5: Data Analysis Dashboard</h1><br></div><div><p>Welcome to Project 5 of the 'Masters in Python with 5 Real-World Projects' course! In this project, you will learn how to create a comprehensive Data Analysis Dashboard using Python. This dashboard will allow users to visualize and interact with data, making it easier to derive insights and make data-driven decisions.</p><br></div><div><br></div><div><h2>Objectives</h2><br></div><div><ul><br></div><div>    <li>Understand the fundamentals of data visualization.</li><br></div><div>    <li>Learn to use Python libraries such as Pandas, Matplotlib, and Plotly.</li><br></div><div>    <li>Build an interactive dashboard using Dash or Streamlit.</li><br></div><div>    <li>Implement data filtering and aggregation techniques.</li><br></div><div>    <li>Deploy your dashboard for real-world use.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The primary goal of this project is to develop a Data Analysis Dashboard that can handle various datasets and present key metrics through interactive visualizations. You will work with real-world data, allowing you to apply the skills you have acquired throughout the course.</p><br></div><div><br></div><div><h2>Step-by-Step Guide</h2><br></div><div><h3>1. Data Acquisition</h3><br></div><div><p>Start by selecting a dataset relevant to your interests or industry. Popular sources include:</p><br></div><div><ul><br></div><div>    <li><a href='https://www.kaggle.com/'>Kaggle</a></li><br></div><div>    <li><a href='https://data.gov/'>Data.gov</a></li><br></div><div>    <li><a href='https://www.uci.edu/'>UCI Machine Learning Repository</a></li><br></div><div></ul><br></div><div><p>Once you have selected your dataset, download it in a suitable format (CSV, JSON, etc.).</p><br></div><div><br></div><div><h3>2. Data Preparation</h3><br></div><div><p>Utilize Pandas to clean and preprocess your data. This includes:</p><br></div><div><ul><br></div><div>    <li>Handling missing values.</li><br></div><div>    <li>Normalizing data formats.</li><br></div><div>    <li>Filtering out unnecessary columns.</li><br></div><div></ul><br></div><div><p>Ensure your data is ready for analysis by performing exploratory data analysis (EDA) to understand its structure and key features.</p><br></div><div><br></div><div><h3>3. Data Visualization</h3><br></div><div><p>Use Matplotlib and Plotly to create visualizations that represent your data effectively. Consider the following types of visualizations:</p><br></div><div><ul><br></div><div>    <li>Bar charts for categorical data.</li><br></div><div>    <li>Line graphs for trends over time.</li><br></div><div>    <li>Heatmaps for correlation matrices.</li><br></div><div></ul><br></div><div><p>Make sure your visualizations are clear, informative, and aesthetically pleasing.</p><br></div><div><br></div><div><h3>4. Building the Dashboard</h3><br></div><div><p>Choose a framework like Dash or Streamlit to create your interactive dashboard. Key components to include:</p><br></div><div><ul><br></div><div>    <li>Dropdowns for selecting data filters.</li><br></div><div>    <li>Sliders for adjusting parameters.</li><br></div><div>    <li>Graphs that update dynamically based on user input.</li><br></div><div></ul><br></div><div><p>Focus on user experience by ensuring that the dashboard is intuitive and responsive.</p><br></div><div><br></div><div><h3>5. Deployment</h3><br></div><div><p>Once your dashboard is complete, deploy it using platforms such as Heroku or Streamlit Sharing. This allows users to access your dashboard from anywhere, providing a real-world application of your project.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>By the end of this project, you will have developed a fully functional Data Analysis Dashboard that showcases your ability to manipulate data, create visualizations, and build interactive applications using Python. This project not only enhances your technical skills but also prepares you for real-world data analysis challenges.</p><br></div><div><br></div><div><h2>Next Steps</h2><br></div><div><p>After completing this project, consider exploring additional features such as user authentication, advanced analytics, or integrating machine learning models to further enhance your dashboard's capabilities. The skills you gain here will be invaluable in your journey as a data professional.</p></div>	\N	\N	5	f	2026-02-20 16:27:42.84133	\N
415	111	8	Getting Started with Python	<div>Welcome to 'Getting Started with Python,' the first lesson in the 'Masters in Python with 5 Real-World Projects' course! In this lesson, we will delve into the fundamentals of Python programming, setting a solid foundation for your journey into the world of coding. Whether you are a complete beginner or looking to brush up on your skills, this lesson is designed to equip you with the essential knowledge and tools to start programming in Python.<br></div><div><br></div><div>### 1. Introduction to Python<br></div><div>Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, Python has gained immense popularity among developers due to its versatility and ease of use. It is widely used in various domains, including web development, data analysis, artificial intelligence, scientific computing, and more.<br></div><div><br></div><div>### 2. Why Learn Python?<br></div><div>- **Easy to Read and Write**: Python's syntax is clear and intuitive, making it an excellent choice for beginners.<br></div><div>- **Versatile**: Python can be used for a wide range of applications, from simple scripts to complex machine learning algorithms.<br></div><div>- **Strong Community Support**: Python has a large and active community, providing extensive libraries and frameworks that can help you solve problems more efficiently.<br></div><div>- **Career Opportunities**: Proficiency in Python opens doors to numerous job opportunities in various fields, including software development, data science, and automation.<br></div><div><br></div><div>### 3. Setting Up Your Python Environment<br></div><div>Before you start coding, you need to set up your development environment. Here’s how:<br></div><div>- **Download and Install Python**: Visit the official Python website (https://www.python.org/downloads/) and download the latest version for your operating system. Follow the installation instructions.<br></div><div>- **Choose an Integrated Development Environment (IDE)**: While you can write Python code in any text editor, using an IDE can enhance your coding experience. Popular choices include:<br></div><div>  - **PyCharm**: A powerful IDE specifically for Python.<br></div><div>  - **Visual Studio Code**: A lightweight editor with Python support through extensions.<br></div><div>  - **Jupyter Notebook**: Ideal for data analysis and visualization, allowing you to create interactive notebooks.<br></div><div><br></div><div>### 4. Your First Python Program<br></div><div>Let’s write a simple Python program to get you started:<br></div><div>```python<br></div><div>print('Hello, World!')<br></div><div>```<br></div><div>This program uses the `print()` function to display the text 'Hello, World!' on the screen. To run this program:<br></div><div>1. Open your chosen IDE.<br></div><div>2. Create a new Python file (e.g., `hello.py`).<br></div><div>3. Type the code above and save the file.<br></div><div>4. Run the program by executing the command `python hello.py` in your terminal or using the run option in your IDE.<br></div><div><br></div><div>### 5. Understanding Python Basics<br></div><div>Before diving deeper, it's crucial to understand some basic concepts:<br></div><div>- **Variables**: Store data values. Example: `name = 'Alice'`<br></div><div>- **Data Types**: Python has several built-in data types, including integers, floats, strings, and lists.<br></div><div>- **Control Structures**: Learn about conditionals (`if`, `else`) and loops (`for`, `while`) to control the flow of your program.<br></div><div>- **Functions**: Functions allow you to encapsulate code for reuse. Example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    print(f'Hello, {name}!')<br></div><div>```<br></div><div><br></div><div>### 6. Next Steps<br></div><div>Congratulations on taking the first step in your Python journey! In the next lessons, we will explore more advanced topics, including data structures, object-oriented programming, and libraries that will enable you to work on real-world projects. Make sure to practice coding regularly and engage with the Python community through forums and coding challenges.<br></div><div><br></div><div>### 7. Resources for Further Learning<br></div><div>- **Official Python Documentation**: https://docs.python.org/3/<br></div><div>- **Codecademy Python Course**: A great interactive platform to learn Python basics.<br></div><div>- **LeetCode**: Practice coding problems to enhance your problem-solving skills.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this lesson, you have laid the groundwork for a successful learning experience in Python. Remember, the key to mastering programming is consistent practice and exploration. Embrace the challenges ahead and enjoy your programming journey!</div>	https://youtube.com/embed/t2_Q2BRzeEE	\N	1	t	2026-02-20 16:27:49.271103	https://our-shiksha.trainercentral.in/course/attend?previouspage=clientapp#/course/23063000000007005/attend/section/23063000000007010
416	111	8	Python Syntax and Semantics	<div>In this lesson, we will delve into the fundamental concepts of Python syntax and semantics, which are essential for any aspiring Python developer. Understanding these concepts is crucial as they form the foundation upon which you will build your programming skills. Let's break down these concepts into manageable sections.<br></div><div><br></div><div>### 1. Introduction to Syntax<br></div><div>Python syntax refers to the set of rules that define the combinations of symbols that are considered to be correctly structured programs in the Python language. Syntax governs how we write Python code, including how we structure statements, define variables, and use functions.<br></div><div><br></div><div>- **Basic Structure**: Every Python program is made up of statements that are executed in a specific order. The basic structure includes:<br></div><div>  - **Variables**: Used to store data values. For example, `x = 5` assigns the integer 5 to the variable `x`.<br></div><div>  - **Data Types**: Python supports various data types, including integers, floats, strings, and booleans.<br></div><div>  - **Indentation**: Python uses indentation to define the scope of loops, functions, and conditionals. This is a unique feature of Python that distinguishes it from many other programming languages.<br></div><div><br></div><div>### 2. Key Syntax Elements<br></div><div>Let's explore some key elements of Python syntax:<br></div><div><br></div><div>- **Comments**: Use the `#` symbol to write comments in your code, which are ignored by the interpreter. Example: `# This is a comment`<br></div><div>- **Operators**: Python includes various operators for arithmetic, comparison, and logical operations. For instance, `+`, `-`, `*`, and `/` are arithmetic operators.<br></div><div>- **Control Structures**: These include `if`, `for`, and `while` statements, which allow you to control the flow of your program based on conditions.<br></div><div><br></div><div>### 3. Understanding Semantics<br></div><div>While syntax focuses on the structure of the code, semantics refers to the meaning behind the code. It deals with what the code does when it is executed. Understanding semantics is crucial for writing effective and efficient code.<br></div><div><br></div><div>- **Execution Flow**: The semantics of Python dictate how the code is executed. For example, in a conditional statement, the code block under the `if` statement will only execute if the condition evaluates to `True`.<br></div><div>- **Function Behavior**: When you define a function, the semantics define what happens when the function is called. For instance, `def add(a, b): return a + b` means that when you call `add(2, 3)`, it will return `5`.<br></div><div><br></div><div>### 4. Common Syntax Errors<br></div><div>As you begin coding in Python, you may encounter syntax errors. These occur when the code does not conform to the rules of the language. Common syntax errors include:<br></div><div>- **Indentation Errors**: Occur when the indentation levels are inconsistent.<br></div><div>- **Syntax Errors**: Occur when there is a typo or incorrect use of Python syntax, such as missing colons or parentheses.<br></div><div><br></div><div>### 5. Best Practices<br></div><div>To write clean and effective Python code, consider the following best practices:<br></div><div>- **Consistent Indentation**: Always use the same number of spaces (usually 4) for indentation.<br></div><div>- **Meaningful Variable Names**: Use descriptive names for variables and functions to enhance code readability.<br></div><div>- **Comment Your Code**: Write comments to explain complex logic or important sections of your code.<br></div><div><br></div><div>### Conclusion<br></div><div>In summary, mastering Python syntax and semantics is a critical step in your journey as a Python developer. By understanding the rules of the language and the meaning behind your code, you will be better equipped to write efficient, readable, and maintainable programs. In the next lesson, we will explore data types and variables in greater detail, allowing you to apply your understanding of syntax and semantics to practical programming tasks.</div>	\N	\N	2	f	2026-02-20 16:27:49.275392	\N
417	111	8	Data Types and Variables	<div><h1>Understanding Data Types and Variables in Python</h1><br></div><div><br></div><div><p>In the world of programming, data types and variables are foundational concepts that every programmer must grasp. This lesson will delve into the essence of data types, the significance of variables, and how they interact within the Python programming language.</p><br></div><div><br></div><div><h2>What are Data Types?</h2><br></div><div><p>Data types are classifications that dictate what kind of data can be stored and manipulated within a program. Python, being a dynamically typed language, automatically determines the type of a variable at runtime. Here are the primary data types in Python:</p><br></div><div><br></div><div><ul><br></div><div>  <li><strong>Integers (int):</strong> Whole numbers, both positive and negative, without decimals. Example: 5, -3, 42.</li><br></div><div>  <li><strong>Floating Point Numbers (float):</strong> Numbers that contain a decimal point. Example: 3.14, -0.001, 2.0.</li><br></div><div>  <li><strong>Strings (str):</strong> Sequences of characters enclosed in single or double quotes. Example: 'Hello, World!', "Python".</li><br></div><div>  <li><strong>Booleans (bool):</strong> Represents one of two values: True or False. Useful for conditional statements.</li><br></div><div>  <li><strong>Lists:</strong> Ordered collections of items, which can be of mixed data types. Example: [1, 2.5, 'Python', True].</li><br></div><div>  <li><strong>Dictionaries:</strong> Unordered collections of key-value pairs. Example: {'name': 'Alice', 'age': 30}.</li><br></div><div>  <li><strong>Tuples:</strong> Immutable ordered collections. Example: (1, 2, 3).</li><br></div><div>  <li><strong>Sets:</strong> Unordered collections of unique items. Example: {1, 2, 3}.</li><br></div><div></ul><br></div><div><br></div><div><h2>What are Variables?</h2><br></div><div><p>Variables are symbolic names that represent data values. They act as containers for storing data that can be referenced and manipulated throughout your program. In Python, variables are created by simply assigning a value to a name using the assignment operator (=).</p><br></div><div><br></div><div><h3>Variable Naming Rules</h3><br></div><div><p>When creating variables, it's important to follow certain naming conventions:</p><br></div><div><ul><br></div><div>  <li>Variable names must start with a letter (a-z, A-Z) or an underscore (_).</li><br></div><div>  <li>Subsequent characters can be letters, numbers (0-9), or underscores.</li><br></div><div>  <li>Variable names are case-sensitive (e.g., <code>myVar</code> and <code>myvar</code> are different).</li><br></div><div>  <li>Avoid using reserved keywords (e.g., <code>if</code>, <code>else</code>, <code>for</code>, etc.).</li><br></div><div></ul><br></div><div><br></div><div><h3>Assigning Values to Variables</h3><br></div><div><p>To assign a value to a variable, use the following syntax:</p><br></div><div><pre><code>variable_name = value</code></pre><br></div><div><p>For example:</p><br></div><div><pre><code>age = 25<br></div><div>name = 'John'<br></div><div>height = 5.9<br></div><div>is_student = True</code></pre><br></div><div><br></div><div><h2>Type Checking and Conversion</h2><br></div><div><p>In Python, you can check the type of a variable using the <code>type()</code> function:</p><br></div><div><pre><code>print(type(age))  # Output: <class 'int'></code></pre><br></div><div><p>If you need to convert between data types, Python provides built-in functions such as <code>int()</code>, <code>float()</code>, and <code>str()</code>:</p><br></div><div><pre><code>num_str = '10'<br></div><div>num_int = int(num_str)  # Converts string to integer</code></pre><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Data types and variables are crucial to understanding how to store and manipulate data in Python. Mastering these concepts will empower you to write more efficient and effective code. In the next lesson, we will explore control structures that allow you to manage the flow of your programs.</p></div>	\N	\N	3	f	2026-02-20 16:27:49.279214	\N
418	111	8	Control Structures	<div>In this lesson, we will delve into the essential concept of control structures in Python, which serve as the foundation for making decisions, repeating actions, and managing the flow of programs. Control structures allow programmers to dictate the order in which statements are executed, enabling the creation of dynamic and responsive applications.<br></div><div><br></div><div>### 1. Introduction to Control Structures<br></div><div>Control structures are constructs that dictate the flow of control in a program. They can be broadly categorized into three types:<br></div><div>- **Sequential Structures**: The default mode of execution where statements are executed one after another.<br></div><div>- **Selection Structures**: Allow the program to choose different paths based on conditions (e.g., `if`, `elif`, `else`).<br></div><div>- **Repetition Structures**: Enable the execution of a block of code multiple times (e.g., `for` loops, `while` loops).<br></div><div><br></div><div>### 2. Selection Structures<br></div><div>Selection structures are crucial for decision-making in code. Let's explore the key components:<br></div><div><br></div><div>#### 2.1 The `if` Statement<br></div><div>The `if` statement evaluates a condition and executes a block of code if the condition is true.<br></div><div>```python<br></div><div>age = 18<br></div><div>if age >= 18:<br></div><div>    print('You are eligible to vote.')<br></div><div>```<br></div><div>In this example, the message is printed only if the `age` variable is 18 or older.<br></div><div><br></div><div>#### 2.2 The `elif` and `else` Statements<br></div><div>To handle multiple conditions, we use `elif` (else if) and `else` statements. This allows for more complex decision-making.<br></div><div>```python<br></div><div>score = 85<br></div><div>if score >= 90:<br></div><div>    print('Grade: A')<br></div><div>elif score >= 80:<br></div><div>    print('Grade: B')<br></div><div>else:<br></div><div>    print('Grade: C')<br></div><div>```<br></div><div>Here, the program checks the score and prints the corresponding grade based on the defined conditions.<br></div><div><br></div><div>### 3. Repetition Structures<br></div><div>Repetition structures allow us to execute a block of code multiple times, which is essential for tasks like iterating over data.<br></div><div><br></div><div>#### 3.1 The `for` Loop<br></div><div>The `for` loop is used to iterate over a sequence (like a list, tuple, or string).<br></div><div>```python<br></div><div>fruits = ['apple', 'banana', 'cherry']<br></div><div>for fruit in fruits:<br></div><div>    print(fruit)<br></div><div>```<br></div><div>In this example, each fruit in the list is printed one by one.<br></div><div><br></div><div>#### 3.2 The `while` Loop<br></div><div>The `while` loop continues to execute as long as a specified condition is true.<br></div><div>```python<br></div><div>count = 0<br></div><div>while count < 5:<br></div><div>    print(count)<br></div><div>    count += 1<br></div><div>```<br></div><div>This loop will print numbers from 0 to 4, demonstrating how conditions can control the flow of execution.<br></div><div><br></div><div>### 4. Nested Control Structures<br></div><div>Control structures can also be nested within each other, allowing for more complex logic. For instance, you can have an `if` statement inside a loop:<br></div><div>```python<br></div><div>for number in range(10):<br></div><div>    if number % 2 == 0:<br></div><div>        print(f'{number} is even')<br></div><div>    else:<br></div><div>        print(f'{number} is odd')<br></div><div>```<br></div><div>This code checks each number from 0 to 9 and prints whether it is even or odd.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>Understanding control structures is vital for any Python programmer. They allow you to build programs that can respond to different inputs and conditions, making your applications more versatile and powerful. In the upcoming lessons, we will apply these concepts in real-world projects, enhancing your skills and preparing you for practical programming challenges. <br></div><div><br></div><div>### 6. Practice Exercises<br></div><div>To solidify your understanding, try the following exercises:<br></div><div>1. Write a program that checks if a number is positive, negative, or zero using control structures.<br></div><div>2. Create a multiplication table using a nested loop.<br></div><div>3. Develop a simple quiz application that evaluates user input and provides feedback based on their answers.<br></div><div><br></div><div>By mastering control structures, you will be well on your way to becoming a proficient Python developer, ready to tackle more advanced topics and projects.</div>	\N	\N	4	f	2026-02-20 16:27:49.282146	\N
419	112	8	Functions and Modules	<div>In this lesson, we will delve into two fundamental concepts in Python programming: Functions and Modules. Understanding these concepts is crucial for writing clean, efficient, and reusable code. Let's explore each of these topics in detail.<br></div><div><br></div><div>### 1. Functions in Python<br></div><div>Functions are reusable blocks of code that perform a specific task. They help in organizing code, making it more readable, and reducing redundancy. Here are some key aspects of functions:<br></div><div><br></div><div>#### 1.1 Defining a Function<br></div><div>To define a function in Python, we use the `def` keyword followed by the function name and parentheses. Here’s a simple example:<br></div><div>```python<br></div><div>def greet(name):<br></div><div>    return f'Hello, {name}!'<br></div><div>```<br></div><div>This function, `greet`, takes one parameter, `name`, and returns a greeting message.<br></div><div><br></div><div>#### 1.2 Calling a Function<br></div><div>Once a function is defined, you can call it by using its name followed by parentheses:<br></div><div>```python<br></div><div>print(greet('Alice'))  # Output: Hello, Alice!<br></div><div>```<br></div><div><br></div><div>#### 1.3 Function Parameters and Arguments<br></div><div>Functions can accept parameters, allowing you to pass values into them. There are several types of parameters:<br></div><div>- **Positional Parameters**: These are parameters that must be provided in a specific order.<br></div><div>- **Keyword Parameters**: These allow you to specify parameters by name, making your code more readable.<br></div><div>- **Default Parameters**: You can set default values for parameters, making them optional.<br></div><div><br></div><div>Example:<br></div><div>```python<br></div><div>def greet(name, greeting='Hello'):<br></div><div>    return f'{greeting}, {name}!'<br></div><div>```<br></div><div><br></div><div>#### 1.4 Return Statement<br></div><div>The `return` statement is used to exit a function and send a value back to the caller. If no return statement is specified, the function returns `None` by default.<br></div><div><br></div><div>### 2. Scope of Variables<br></div><div>Understanding variable scope is essential when working with functions. Variables defined inside a function are local to that function and cannot be accessed outside of it. Conversely, variables defined outside functions are global and can be accessed anywhere in the code.<br></div><div><br></div><div>### 3. Modules in Python<br></div><div>Modules are files containing Python code that can define functions, classes, and variables. They allow you to organize your code into manageable sections and promote code reuse.<br></div><div><br></div><div>#### 3.1 Creating a Module<br></div><div>To create a module, simply save your Python code in a file with a `.py` extension. For example, if you create a file named `math_operations.py` with the following content:<br></div><div>```python<br></div><div>def add(a, b):<br></div><div>    return a + b<br></div><div><br></div><div>def subtract(a, b):<br></div><div>    return a - b<br></div><div>```<br></div><div><br></div><div>#### 3.2 Importing a Module<br></div><div>You can import a module into another Python file using the `import` statement. For example:<br></div><div>```python<br></div><div>import math_operations<br></div><div><br></div><div>result = math_operations.add(5, 3)<br></div><div>print(result)  # Output: 8<br></div><div>```<br></div><div><br></div><div>#### 3.3 Using `from` to Import Specific Functions<br></div><div>You can also import specific functions from a module using the `from` keyword:<br></div><div>```python<br></div><div>from math_operations import subtract<br></div><div><br></div><div>result = subtract(10, 4)<br></div><div>print(result)  # Output: 6<br></div><div>```<br></div><div><br></div><div>### 4. Benefits of Using Functions and Modules<br></div><div>- **Code Reusability**: Functions and modules allow you to reuse code, saving time and reducing errors.<br></div><div>- **Improved Readability**: Breaking down code into functions and modules makes it easier to read and understand.<br></div><div>- **Easier Maintenance**: When you need to make changes, you can do so in one place rather than throughout your codebase.<br></div><div><br></div><div>### 5. Conclusion<br></div><div>In this lesson, we covered the essential aspects of functions and modules in Python. Mastering these concepts will significantly enhance your programming skills and prepare you for more complex projects. In the next lesson, we will explore error handling and debugging techniques, which are vital for developing robust applications.</div>	\N	\N	1	t	2026-02-20 16:27:49.287997	\N
420	112	8	Object-Oriented Programming	<div><h1>Understanding Object-Oriented Programming (OOP)</h1><br></div><div><p>Object-Oriented Programming (OOP) is a programming paradigm that uses 'objects' to represent data and methods to manipulate that data. It is a foundational concept in Python and many other programming languages, allowing for code reusability, scalability, and ease of maintenance.</p><br></div><div><br></div><div><h2>Key Concepts of OOP</h2><br></div><div><ul><br></div><div>  <li><strong>Classes:</strong> A class is a blueprint for creating objects. It defines a set of attributes and methods that the created objects will have. For example, a class <code>Car</code> might have attributes like <code>color</code> and <code>model</code>, and methods like <code>drive()</code> and <code>stop()</code>.</li><br></div><div>  <li><strong>Objects:</strong> An object is an instance of a class. Using the <code>Car</code> class, you can create objects like <code>my_car = Car('red', 'Toyota')</code>. Each object can have different attribute values while sharing the same methods.</li><br></div><div>  <li><strong>Encapsulation:</strong> This principle restricts direct access to some of an object's components, which can prevent the accidental modification of data. In Python, you can use private and public attributes to enforce encapsulation.</li><br></div><div>  <li><strong>Inheritance:</strong> Inheritance allows a new class to inherit the properties and methods of an existing class. This promotes code reusability. For instance, you can create a class <code>ElectricCar</code> that inherits from <code>Car</code> and adds additional features like <code>charge()</code>.</li><br></div><div>  <li><strong>Polymorphism:</strong> Polymorphism allows methods to do different things based on the object it is acting upon. This means that a method can be defined in a base class and overridden in a derived class, enabling different behaviors.</li><br></div><div></ul><br></div><div><br></div><div><h2>Why Use OOP in Python?</h2><br></div><div><p>OOP provides several advantages that can enhance your programming experience and the quality of your code:</p><br></div><div><ul><br></div><div>  <li><strong>Modularity:</strong> Code can be organized into classes and modules, making it easier to manage and understand.</li><br></div><div>  <li><strong>Reusability:</strong> Classes can be reused across different projects, reducing redundancy and saving time.</li><br></div><div>  <li><strong>Maintainability:</strong> Changes to a class can be made in one place, and those changes will propagate to all instances of the class.</li><br></div><div>  <li><strong>Collaboration:</strong> OOP makes it easier for teams to work on different parts of a project simultaneously, as each team can focus on different classes.</li><br></div><div></ul><br></div><div><br></div><div><h2>Implementing OOP in Python</h2><br></div><div><p>Here’s a simple example to illustrate how to implement OOP in Python:</p><br></div><div><pre><code>class Car:<br></div><div>    def __init__(self, color, model):<br></div><div>        self.color = color<br></div><div>        self.model = model<br></div><div><br></div><div>    def drive(self):<br></div><div>        print(f'The {self.color} {self.model} is driving.')<br></div><div><br></div><div>class ElectricCar(Car):<br></div><div>    def charge(self):<br></div><div>        print(f'The {self.color} {self.model} is charging.')<br></div><div><br></div><div># Creating objects<br></div><div>my_car = Car('red', 'Toyota')<br></div><div>my_car.drive()<br></div><div><br></div><div>my_electric_car = ElectricCar('blue', 'Tesla')<br></div><div>my_electric_car.drive()<br></div><div>my_electric_car.charge()</code></pre><br></div><div><p>In this example, we define a base class <code>Car</code> and a derived class <code>ElectricCar</code>. The derived class inherits the properties and methods of the base class while adding its own functionality.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>Object-Oriented Programming is an essential skill for any Python developer. Understanding its principles will not only improve your coding abilities but also prepare you for real-world programming tasks. By mastering OOP, you can create more efficient, scalable, and maintainable code. As you progress in this course, you will apply these concepts in real-world projects, solidifying your understanding and enhancing your programming toolkit.</p></div>	\N	\N	2	f	2026-02-20 16:27:49.291259	\N
421	112	8	Error Handling and Exceptions	<div>In the world of programming, errors are inevitable. Whether they arise from user input, system failures, or logical mistakes, handling these errors gracefully is crucial for creating robust and user-friendly applications. This lesson focuses on 'Error Handling and Exceptions' in Python, an essential skill for any aspiring Python developer. <br></div><div><br></div><div>### Understanding Errors and Exceptions<br></div><div><br></div><div>Errors in Python can be broadly categorized into two types: syntax errors and exceptions. <br></div><div><br></div><div>1. **Syntax Errors**: These occur when the code does not conform to the syntax rules of the Python language. For example, forgetting a colon at the end of a function definition will raise a syntax error. <br></div><div>   <br></div><div>   ```python<br></div><div>   def my_function()<br></div><div>       print("Hello, World!")  # This will raise a SyntaxError<br></div><div>   ```<br></div><div><br></div><div>2. **Exceptions**: Unlike syntax errors, exceptions are raised during the execution of a program when the interpreter encounters a situation it cannot handle. Common exceptions include `ValueError`, `TypeError`, `IndexError`, and `ZeroDivisionError`. <br></div><div><br></div><div>### The Try-Except Block<br></div><div><br></div><div>To handle exceptions in Python, we use the `try` and `except` blocks. The code that may raise an exception is placed inside the `try` block, and the code that handles the exception is placed inside the `except` block. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    result = 10 / 0  # This will raise a ZeroDivisionError<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>In this example, when the division by zero occurs, the program does not crash; instead, it gracefully handles the error and prints a user-friendly message. <br></div><div><br></div><div>### Catching Multiple Exceptions<br></div><div><br></div><div>Sometimes, you may want to handle multiple exceptions that could arise from a block of code. You can do this by specifying multiple `except` clauses. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>```  <br></div><div><br></div><div>### The Else and Finally Clauses<br></div><div><br></div><div>In addition to `try` and `except`, Python provides `else` and `finally` clauses to enhance error handling. The `else` block runs if the `try` block does not raise an exception, while the `finally` block always runs, regardless of whether an exception occurred. <br></div><div><br></div><div>```python<br></div><div>try:<br></div><div>    value = int(input("Enter a number: "))<br></div><div>    result = 10 / value<br></div><div>except ValueError:<br></div><div>    print("That's not a valid number!")<br></div><div>except ZeroDivisionError:<br></div><div>    print("You can't divide by zero!")<br></div><div>else:<br></div><div>    print(f"The result is {result}")<br></div><div>finally:<br></div><div>    print("Execution completed.")<br></div><div>```  <br></div><div><br></div><div>### Raising Exceptions<br></div><div><br></div><div>You can also raise exceptions intentionally using the `raise` statement. This is useful when you want to enforce certain conditions in your code. <br></div><div><br></div><div>```python<br></div><div>def check_positive(number):<br></div><div>    if number < 0:<br></div><div>        raise ValueError("Number must be positive!")<br></div><div>    return number<br></div><div>```  <br></div><div><br></div><div>### Custom Exception Classes<br></div><div><br></div><div>For more complex applications, you may want to define your own custom exceptions. This allows for more specific error handling tailored to your application's needs. <br></div><div><br></div><div>```python<br></div><div>class CustomError(Exception):<br></div><div>    pass<br></div><div><br></div><div>try:<br></div><div>    raise CustomError("This is a custom error message.")<br></div><div>except CustomError as e:<br></div><div>    print(e)<br></div><div>```  <br></div><div><br></div><div>### Conclusion<br></div><div><br></div><div>Error handling is a vital skill in Python programming. By mastering `try`, `except`, `else`, and `finally`, as well as understanding how to raise and define custom exceptions, you can create applications that are not only functional but also robust and user-friendly. This lesson lays the groundwork for effective error management, which will be crucial as you build real-world projects in this course.</div>	\N	\N	3	f	2026-02-20 16:27:49.294165	\N
422	112	8	Working with Libraries	<div>In this lesson, we will delve into the concept of libraries in Python, a fundamental aspect of programming that enhances productivity and code reusability. Libraries are collections of pre-written code that provide specific functionalities, allowing developers to leverage existing solutions instead of writing code from scratch. This lesson will cover the following key areas:<br></div><div><br></div><div>### 1. Understanding Libraries<br></div><div>Libraries in Python can be thought of as toolkits that provide a set of functions and methods to perform various tasks. They can be categorized into:<br></div><div>- **Standard Libraries**: These are included with Python and provide a wide range of functionalities, such as file I/O, system calls, and data manipulation.<br></div><div>- **Third-Party Libraries**: These are external packages created by the community or organizations that can be installed and used to extend Python's capabilities.<br></div><div><br></div><div>### 2. Why Use Libraries?<br></div><div>Using libraries offers several advantages:<br></div><div>- **Efficiency**: Libraries save time by providing ready-to-use code, allowing developers to focus on the unique aspects of their projects.<br></div><div>- **Reliability**: Well-maintained libraries are tested and widely used, reducing the likelihood of bugs in your code.<br></div><div>- **Community Support**: Many libraries have large communities that contribute to their development and provide support through documentation and forums.<br></div><div><br></div><div>### 3. How to Import Libraries<br></div><div>To use a library in your Python code, you need to import it. The basic syntax for importing a library is:<br></div><div>```python<br></div><div>import library_name<br></div><div>```<br></div><div>For example, to import the `math` library, you would write:<br></div><div>```python<br></div><div>import math<br></div><div>```<br></div><div>You can also import specific functions from a library:<br></div><div>```python<br></div><div>from library_name import function_name<br></div><div>```<br></div><div>This allows you to use the function directly without prefixing it with the library name.<br></div><div><br></div><div>### 4. Popular Python Libraries<br></div><div>Here are some widely-used libraries that you will encounter in your Python journey:<br></div><div>- **NumPy**: A library for numerical computations, particularly useful for handling arrays and matrices.<br></div><div>- **Pandas**: A data manipulation library that provides data structures like DataFrames for handling structured data.<br></div><div>- **Matplotlib**: A plotting library that allows you to create static, animated, and interactive visualizations in Python.<br></div><div>- **Requests**: A library for making HTTP requests, simplifying the process of working with APIs.<br></div><div><br></div><div>### 5. Installing Third-Party Libraries<br></div><div>To install third-party libraries, you can use `pip`, Python's package installer. The command to install a library is:<br></div><div>```bash<br></div><div>pip install library_name<br></div><div>```<br></div><div>For example, to install the Requests library, you would run:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div>Make sure to have a virtual environment set up to manage dependencies effectively.<br></div><div><br></div><div>### 6. Best Practices for Using Libraries<br></div><div>When working with libraries, consider the following best practices:<br></div><div>- **Read Documentation**: Familiarize yourself with the library's documentation to understand its features and usage.<br></div><div>- **Keep Libraries Updated**: Regularly update libraries to benefit from new features, improvements, and security patches.<br></div><div>- **Limit Dependencies**: Use only the libraries you need to keep your project lightweight and manageable.<br></div><div><br></div><div>### 7. Real-World Application<br></div><div>In the context of our course, you will apply your knowledge of libraries in the five real-world projects. For instance, when working on a data analysis project, you might use Pandas for data manipulation and Matplotlib for visualization. By leveraging libraries, you will be able to create robust and efficient solutions while enhancing your coding skills.<br></div><div><br></div><div>### Conclusion<br></div><div>Understanding and effectively using libraries is crucial for any Python developer. They not only streamline the coding process but also allow you to harness the collective knowledge of the programming community. As we progress through this course, you will gain hands-on experience with various libraries, enabling you to build sophisticated applications with ease.</div>	\N	\N	4	f	2026-02-20 16:27:49.299229	\N
423	113	8	Introduction to Pandas	<div>### Introduction to Pandas<br></div><div><br></div><div>Pandas is a powerful and versatile open-source data analysis and manipulation library for Python. It provides data structures and functions needed to work with structured data seamlessly. This lesson will introduce you to the core concepts of Pandas, its key features, and how to get started with data analysis using this library.<br></div><div><br></div><div>#### What is Pandas?<br></div><div>Pandas is built on top of NumPy and is designed for data manipulation and analysis. It offers two primary data structures:<br></div><div>- **Series**: A one-dimensional labeled array capable of holding any data type.<br></div><div>- **DataFrame**: A two-dimensional labeled data structure with columns of potentially different types. It is similar to a spreadsheet or SQL table.<br></div><div><br></div><div>#### Key Features of Pandas<br></div><div>1. **Data Alignment**: Pandas automatically aligns data based on labels, making it easy to work with data from different sources.<br></div><div>2. **Handling Missing Data**: Pandas provides robust tools for detecting, removing, and filling missing data, ensuring data integrity.<br></div><div>3. **Data Transformation**: With built-in functions, you can easily reshape, merge, and concatenate datasets.<br></div><div>4. **Time Series Analysis**: Pandas has extensive support for time series data, allowing for easy manipulation and analysis of date and time data.<br></div><div>5. **Data Visualization**: While Pandas itself is not a visualization library, it integrates well with libraries like Matplotlib and Seaborn, enabling effective data visualization.<br></div><div><br></div><div>#### Getting Started with Pandas<br></div><div>To begin using Pandas, you first need to install it. You can do this via pip:<br></div><div>```bash<br></div><div>pip install pandas<br></div><div>```<br></div><div><br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import pandas as pd<br></div><div>```<br></div><div><br></div><div>#### Creating a Series<br></div><div>A Series can be created from a list, dictionary, or NumPy array. Here’s how to create a simple Series:<br></div><div>```python<br></div><div># Creating a Series from a list<br></div><div>data = [10, 20, 30, 40]<br></div><div>series = pd.Series(data)<br></div><div>print(series)<br></div><div>```<br></div><div><br></div><div>#### Creating a DataFrame<br></div><div>A DataFrame can be created from various data sources, including dictionaries, lists, or external files like CSV. Here’s an example of creating a DataFrame from a dictionary:<br></div><div>```python<br></div><div># Creating a DataFrame from a dictionary<br></div><div>data = {<br></div><div>    'Name': ['Alice', 'Bob', 'Charlie'],<br></div><div>    'Age': [24, 30, 22],<br></div><div>    'City': ['New York', 'Los Angeles', 'Chicago']<br></div><div>}<br></div><div>df = pd.DataFrame(data)<br></div><div>print(df)<br></div><div>```<br></div><div><br></div><div>#### Basic DataFrame Operations<br></div><div>1. **Viewing Data**: Use `df.head()` to view the first few rows of the DataFrame.<br></div><div>2. **Descriptive Statistics**: Use `df.describe()` to get a summary of statistics for numerical columns.<br></div><div>3. **Indexing and Selecting Data**: Access rows and columns using `loc` and `iloc` methods.<br></div><div>4. **Filtering Data**: Use boolean indexing to filter data based on conditions.<br></div><div><br></div><div>#### Conclusion<br></div><div>Pandas is an essential tool for anyone working with data in Python. Its intuitive data structures and powerful functionalities make data manipulation straightforward and efficient. In the upcoming lessons, we will dive deeper into advanced features of Pandas, including data cleaning, merging datasets, and performing complex analyses. Get ready to harness the full power of data with Pandas!</div>	\N	\N	1	t	2026-02-20 16:27:49.305092	\N
424	113	8	Data Cleaning Techniques	<div>Data cleaning is a critical step in the data analysis process that ensures the accuracy and quality of your datasets. In this lesson, we will explore various data cleaning techniques that every data professional should master, particularly when working with Python. <br></div><div><br></div><div>### 1. Understanding Data Cleaning<br></div><div>Data cleaning, also known as data cleansing or data scrubbing, involves identifying and correcting errors or inconsistencies in data to improve its quality. This process can include handling missing values, removing duplicates, correcting data types, and addressing outliers. <br></div><div><br></div><div>### 2. Importance of Data Cleaning<br></div><div>- **Accuracy**: Clean data leads to more accurate analysis and insights. <br></div><div>- **Efficiency**: Well-prepared data reduces the time spent on analysis. <br></div><div>- **Decision Making**: High-quality data supports better decision-making in business contexts. <br></div><div><br></div><div>### 3. Common Data Cleaning Techniques<br></div><div>#### a. Handling Missing Values<br></div><div>   - **Removal**: Delete rows or columns with missing values if they are not significant. <br></div><div>   - **Imputation**: Replace missing values with statistical measures like mean, median, or mode. <br></div><div>   - **Interpolation**: Use methods like linear interpolation to estimate missing values based on surrounding data. <br></div><div><br></div><div>#### b. Removing Duplicates<br></div><div>   - Use the `drop_duplicates()` function in pandas to eliminate duplicate entries in your dataset. <br></div><div>   - Ensure that you identify which columns define a duplicate entry. <br></div><div><br></div><div>#### c. Correcting Data Types<br></div><div>   - Ensure that each column in your dataset has the correct data type (e.g., integers, floats, strings). <br></div><div>   - Use the `astype()` method in pandas to convert data types as necessary. <br></div><div><br></div><div>#### d. Outlier Detection and Treatment<br></div><div>   - Identify outliers using statistical methods (e.g., Z-score, IQR). <br></div><div>   - Decide whether to remove, transform, or keep outliers based on their impact on your analysis. <br></div><div><br></div><div>#### e. Standardizing Data<br></div><div>   - Ensure consistency in data formats (e.g., date formats, text casing). <br></div><div>   - Use string methods and regular expressions to clean and standardize text data. <br></div><div><br></div><div>### 4. Tools and Libraries for Data Cleaning in Python<br></div><div>- **Pandas**: The primary library for data manipulation and cleaning. <br></div><div>- **NumPy**: Useful for numerical operations and handling arrays. <br></div><div>- **OpenRefine**: A powerful tool for working with messy data and exploring large datasets. <br></div><div><br></div><div>### 5. Best Practices for Data Cleaning<br></div><div>- **Document Your Process**: Keep track of the cleaning steps you take for reproducibility. <br></div><div>- **Automate When Possible**: Use scripts to automate repetitive cleaning tasks. <br></div><div>- **Validate Your Data**: Always check the results of your cleaning process to ensure data integrity. <br></div><div><br></div><div>### 6. Conclusion<br></div><div>Mastering data cleaning techniques is essential for any data professional. By applying these techniques effectively, you can ensure that your datasets are reliable, which will ultimately lead to more accurate analyses and better-informed decisions. In the next lesson, we will dive into practical applications of these techniques through real-world projects.</div>	\N	\N	2	f	2026-02-20 16:27:49.307618	\N
425	113	8	Data Visualization with Matplotlib	<div>### Introduction to Data Visualization<br></div><div>Data visualization is a crucial aspect of data analysis that allows us to present data in a visual context, making it easier to identify patterns, trends, and insights. In this lesson, we will explore Matplotlib, a powerful Python library for creating static, animated, and interactive visualizations in Python.<br></div><div><br></div><div>### What is Matplotlib?<br></div><div>Matplotlib is one of the most widely used libraries for data visualization in Python. It provides a flexible and comprehensive framework for creating a variety of plots and charts. With Matplotlib, you can create line plots, scatter plots, bar charts, histograms, and much more.<br></div><div><br></div><div>### Getting Started with Matplotlib<br></div><div>To begin using Matplotlib, you first need to install it. You can do this using pip:<br></div><div>```bash<br></div><div>pip install matplotlib<br></div><div>```<br></div><div>Once installed, you can import it into your Python script or Jupyter notebook:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>```<br></div><div><br></div><div>### Basic Plotting with Matplotlib<br></div><div>#### Line Plots<br></div><div>Line plots are one of the simplest forms of data visualization. They are ideal for showing trends over time. Here’s how to create a basic line plot:<br></div><div>```python<br></div><div>import matplotlib.pyplot as plt<br></div><div>import numpy as np<br></div><div><br></div><div># Sample data<br></div><div>x = np.linspace(0, 10, 100)<br></div><div>y = np.sin(x)<br></div><div><br></div><div># Create a line plot<br></div><div>plt.plot(x, y)<br></div><div>plt.title('Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a sine wave, illustrating how to label axes and add a title.<br></div><div><br></div><div>#### Scatter Plots<br></div><div>Scatter plots are useful for showing the relationship between two variables. Here’s an example:<br></div><div>```python<br></div><div># Sample data<br></div><div>x = np.random.rand(50)<br></div><div>y = np.random.rand(50)<br></div><div><br></div><div># Create a scatter plot<br></div><div>plt.scatter(x, y, color='blue', alpha=0.5)<br></div><div>plt.title('Random Scatter Plot')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>This code generates a scatter plot with random data points.<br></div><div><br></div><div>### Customizing Plots<br></div><div>Matplotlib allows extensive customization of your plots. You can change colors, line styles, markers, and much more. Here’s how to customize a line plot:<br></div><div>```python<br></div><div># Customizing a line plot<br></div><div>plt.plot(x, y, color='red', linestyle='--', linewidth=2, marker='o')<br></div><div>plt.title('Customized Sine Wave')<br></div><div>plt.xlabel('X-axis')<br></div><div>plt.ylabel('Y-axis')<br></div><div>plt.grid(True)<br></div><div>plt.show()<br></div><div>```<br></div><div>### Subplots<br></div><div>You can create multiple plots in a single figure using subplots. This is useful for comparing different datasets:<br></div><div>```python<br></div><div>fig, axs = plt.subplots(2, 1)<br></div><div><br></div><div># First subplot<br></div><div>axs[0].plot(x, y, color='blue')<br></div><div>axs[0].set_title('Sine Wave')<br></div><div><br></div><div># Second subplot<br></div><div>axs[1].scatter(x, y, color='green')<br></div><div>axs[1].set_title('Random Scatter')<br></div><div><br></div><div>plt.tight_layout()<br></div><div>plt.show()<br></div><div>```<br></div><div>### Conclusion<br></div><div>In this lesson, we have covered the basics of data visualization using Matplotlib. You learned how to create line plots, scatter plots, customize visualizations, and use subplots. Mastering these skills will enable you to effectively communicate your data insights through compelling visual representations. In the next lesson, we will explore advanced visualization techniques and how to integrate Matplotlib with other libraries such as Pandas and Seaborn for enhanced data analysis.</div>	\N	\N	3	f	2026-02-20 16:27:49.310198	\N
426	113	8	Exploratory Data Analysis	<div>## Introduction to Exploratory Data Analysis (EDA)<br></div><div><br></div><div>Exploratory Data Analysis (EDA) is a critical step in the data analysis process, serving as a foundation for understanding the underlying patterns and structures within a dataset. It involves summarizing the main characteristics of the data, often using visual methods. EDA allows data scientists to formulate hypotheses, identify anomalies, and gain insights that inform further analysis or modeling.<br></div><div><br></div><div>## Objectives of EDA<br></div><div><br></div><div>1. **Understanding Data Distribution**: EDA helps in understanding how data is distributed, identifying skewness, kurtosis, and the presence of outliers.<br></div><div>2. **Identifying Relationships**: It aids in discovering relationships between variables, which can be crucial for predictive modeling.<br></div><div>3. **Detecting Anomalies**: EDA can reveal anomalies or outliers that may need to be addressed before further analysis.<br></div><div>4. **Formulating Hypotheses**: By visualizing data, analysts can generate hypotheses that can be tested with statistical methods.<br></div><div><br></div><div>## Key Techniques in EDA<br></div><div><br></div><div>### 1. Descriptive Statistics<br></div><div>Descriptive statistics provide a summary of the central tendency, dispersion, and shape of a dataset’s distribution. Key metrics include:<br></div><div>- **Mean**: Average value of the dataset.<br></div><div>- **Median**: The middle value when the data is sorted.<br></div><div>- **Mode**: The most frequently occurring value.<br></div><div>- **Standard Deviation**: Measures the amount of variation or dispersion in a set of values.<br></div><div><br></div><div>### 2. Data Visualization<br></div><div>Visualizing data is one of the most powerful tools in EDA. Common visualization techniques include:<br></div><div>- **Histograms**: Useful for understanding the distribution of a single variable.<br></div><div>- **Box Plots**: Effective for identifying outliers and understanding the spread of the data.<br></div><div>- **Scatter Plots**: Helpful for examining relationships between two continuous variables.<br></div><div>- **Heatmaps**: Useful for visualizing correlation matrices.<br></div><div><br></div><div>### 3. Correlation Analysis<br></div><div>Correlation analysis helps in identifying relationships between variables. The correlation coefficient (e.g., Pearson's r) quantifies the degree to which two variables are related. A heatmap can be a great visual tool to represent these correlations.<br></div><div><br></div><div>### 4. Handling Missing Values<br></div><div>Missing data can skew results and lead to incorrect conclusions. EDA should include strategies for handling missing values, such as:<br></div><div>- **Imputation**: Filling in missing values with the mean, median, or mode.<br></div><div>- **Deletion**: Removing records with missing values, if appropriate.<br></div><div><br></div><div>### 5. Outlier Detection<br></div><div>Outliers can significantly affect the results of data analysis. Techniques for detecting outliers include:<br></div><div>- **Z-Score Method**: Identifying data points that lie beyond a certain number of standard deviations from the mean.<br></div><div>- **IQR Method**: Using the interquartile range to identify outliers.<br></div><div><br></div><div>## Tools and Libraries for EDA in Python<br></div><div>Python offers a variety of libraries that facilitate EDA, including:<br></div><div>- **Pandas**: For data manipulation and analysis.<br></div><div>- **Matplotlib**: For creating static, interactive, and animated visualizations.<br></div><div>- **Seaborn**: Built on Matplotlib, it provides a high-level interface for drawing attractive statistical graphics.<br></div><div>- **NumPy**: For numerical operations and handling arrays.<br></div><div>- **Scikit-learn**: For implementing machine learning algorithms and preprocessing data.<br></div><div><br></div><div>## Conclusion<br></div><div>Exploratory Data Analysis is an indispensable part of the data science workflow. By employing EDA techniques, data scientists can uncover valuable insights that guide decision-making and model development. Mastering EDA in Python equips learners with the necessary skills to analyze real-world datasets effectively, paving the way for successful data-driven projects.<br></div><div><br></div><div>## Practical Application<br></div><div>In this course, you will engage in hands-on projects that will require you to apply EDA techniques to real-world datasets. This practical experience will reinforce your understanding and prepare you for data analysis tasks in professional settings.</div>	\N	\N	4	f	2026-02-20 16:27:49.313128	\N
427	114	8	Introduction to Flask	<div>Flask is a micro web framework written in Python that is designed to make web development simple and efficient. In this lesson, we will explore the fundamentals of Flask, its architecture, and how to set up your first web application. By the end of this lesson, you will have a solid understanding of how to create web applications using Flask, and you will be ready to dive deeper into more advanced topics.<br></div><div><br></div><div>### What is Flask?<br></div><div>Flask is a lightweight WSGI (Web Server Gateway Interface) web application framework that is easy to get started with and is flexible enough to scale up to complex applications. It was created by Armin Ronacher and is part of the Pallets Projects. Flask is often referred to as a micro-framework because it does not require particular tools or libraries, allowing developers to choose their components.<br></div><div><br></div><div>### Key Features of Flask<br></div><div>1. **Simplicity**: Flask is designed to be easy to use and learn, making it an excellent choice for beginners.<br></div><div>2. **Flexibility**: Unlike some other frameworks, Flask does not impose a specific structure, allowing developers to organize their projects as they see fit.<br></div><div>3. **Built-in Development Server**: Flask includes a built-in server for development purposes, which makes it easy to test your applications locally.<br></div><div>4. **Jinja2 Templating**: Flask uses Jinja2 for templating, allowing you to create dynamic HTML pages easily.<br></div><div>5. **RESTful Request Dispatching**: Flask supports RESTful request dispatching, making it a great choice for building APIs.<br></div><div><br></div><div>### Setting Up Flask<br></div><div>To get started with Flask, you need to have Python installed on your machine. Follow these steps to set up Flask:<br></div><div>1. **Install Flask**: You can install Flask using pip, the Python package manager. Open your terminal and run:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. **Create a Project Directory**: Create a new directory for your Flask project. For example:<br></div><div>   ```bash<br></div><div>   mkdir my_flask_app<br></div><div>   cd my_flask_app<br></div><div>   ```<br></div><div>3. **Create a Basic Flask Application**: Create a new Python file, `app.py`, and add the following code:<br></div><div>   ```python<br></div><div>   from flask import Flask<br></div><div>   app = Flask(__name__)<br></div><div><br></div><div>   @app.route('/')  # This is the home route<br></div><div>   def home():<br></div><div>       return 'Hello, Flask!'<br></div><div><br></div><div>   if __name__ == '__main__':<br></div><div>       app.run(debug=True)<br></div><div>   ```<br></div><div>4. **Run Your Application**: In your terminal, run the application by executing:<br></div><div>   ```bash<br></div><div>   python app.py<br></div><div>   ```<br></div><div>   You should see output indicating that the server is running. Open your web browser and go to `http://127.0.0.1:5000/` to see your Flask app in action.<br></div><div><br></div><div>### Understanding Flask Routing<br></div><div>Routing is a crucial concept in Flask that allows you to define the URL structure of your web application. In the example above, we defined a route using the `@app.route('/')` decorator. This tells Flask to execute the `home` function when the root URL is accessed. You can create additional routes by adding more decorators:<br></div><div>```python<br></div><div>@app.route('/about')<br></div><div>def about():<br></div><div>    return 'About Page'<br></div><div>```<br></div><div><br></div><div>### Flask Templates<br></div><div>Flask supports templates, which allow you to separate your HTML from your Python code. Create a new directory called `templates` in your project folder and add an HTML file, `index.html`:<br></div><div>```html<br></div><div><!DOCTYPE html><br></div><div><html><br></div><div><head><br></div><div>    <title>My Flask App</title><br></div><div></head><br></div><div><body><br></div><div>    <h1>{{ title }}</h1><br></div><div>    <p>Welcome to my Flask application!</p><br></div><div></body><br></div><div></html><br></div><div>```<br></div><div>You can render this template in your Flask app using:<br></div><div>```python<br></div><div>from flask import render_template<br></div><div><br></div><div>@app.route('/')<br></div><div>def home():<br></div><div>    return render_template('index.html', title='Home')<br></div><div>```<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we introduced Flask and its core features. You learned how to set up a basic Flask application, define routes, and use templates to create dynamic content. Flask's simplicity and flexibility make it an excellent choice for both beginners and experienced developers looking to build web applications quickly. In the upcoming lessons, we will explore more advanced concepts, such as working with databases, user authentication, and deploying your Flask applications. Get ready to take your Python skills to the next level!</div>	\N	\N	1	t	2026-02-20 16:27:49.319536	\N
428	114	8	Building RESTful APIs	<div>## Introduction to RESTful APIs<br></div><div><br></div><div>In the modern web development landscape, RESTful APIs (Representational State Transfer) have become a cornerstone for building scalable and efficient applications. They allow different software systems to communicate over HTTP using standard methods. This lesson will guide you through the principles of RESTful APIs, their components, and how to build one using Python.<br></div><div><br></div><div>## What is REST?<br></div><div><br></div><div>REST is an architectural style that defines a set of constraints and properties based on HTTP. It emphasizes stateless communication, where each request from a client contains all the information needed to process the request. RESTful APIs are designed around resources, which are identified by URLs. <br></div><div><br></div><div>### Key Principles of REST<br></div><div>1. **Statelessness**: Each request is independent, and the server does not store client context between requests.<br></div><div>2. **Client-Server Architecture**: The client and server are separate entities that communicate over HTTP, allowing for separation of concerns.<br></div><div>3. **Cacheability**: Responses must define themselves as cacheable or non-cacheable to improve performance.<br></div><div>4. **Uniform Interface**: A standardized way of interacting with resources, typically using standard HTTP methods like GET, POST, PUT, DELETE.<br></div><div>5. **Layered System**: The architecture can consist of multiple layers, with each layer having specific responsibilities.<br></div><div><br></div><div>## Components of a RESTful API<br></div><div><br></div><div>### Resources<br></div><div>Resources are the key components of a RESTful API. They represent data entities and are typically accessed via unique URLs. For example, in a bookstore API, resources could include `/books`, `/authors`, and `/genres`.<br></div><div><br></div><div>### HTTP Methods<br></div><div>RESTful APIs utilize standard HTTP methods to perform operations on resources:<br></div><div>- **GET**: Retrieve data from the server (e.g., get a list of books).<br></div><div>- **POST**: Create a new resource (e.g., add a new book).<br></div><div>- **PUT**: Update an existing resource (e.g., update book details).<br></div><div>- **DELETE**: Remove a resource (e.g., delete a book).<br></div><div><br></div><div>### Status Codes<br></div><div>HTTP status codes provide feedback about the outcome of API requests. Commonly used status codes include:<br></div><div>- **200 OK**: The request was successful.<br></div><div>- **201 Created**: A resource was successfully created.<br></div><div>- **204 No Content**: The request was successful, but there is no content to return.<br></div><div>- **400 Bad Request**: The server could not understand the request due to invalid syntax.<br></div><div>- **404 Not Found**: The requested resource could not be found.<br></div><div>- **500 Internal Server Error**: The server encountered an unexpected condition.<br></div><div><br></div><div>## Building a RESTful API with Python<br></div><div><br></div><div>In this section, we will build a simple RESTful API using Flask, a lightweight web framework for Python.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>1. Install Flask:<br></div><div>   ```bash<br></div><div>   pip install Flask<br></div><div>   ```<br></div><div>2. Create a new Python file (e.g., `app.py`).<br></div><div><br></div><div>### Step 2: Creating the Flask Application<br></div><div>```python<br></div><div>from flask import Flask, jsonify, request<br></div><div><br></div><div>app = Flask(__name__)<br></div><div><br></div><div># Sample data<br></div><div>books = [<br></div><div>    {'id': 1, 'title': '1984', 'author': 'George Orwell'},<br></div><div>    {'id': 2, 'title': 'To Kill a Mockingbird', 'author': 'Harper Lee'}<br></div><div>]<br></div><div><br></div><div>@app.route('/books', methods=['GET'])<br></div><div>def get_books():<br></div><div>    return jsonify(books)<br></div><div><br></div><div>if __name__ == '__main__':<br></div><div>    app.run(debug=True)<br></div><div>```<br></div><div><br></div><div>### Step 3: Running the API<br></div><div>Run the application with:<br></div><div>```bash<br></div><div>python app.py<br></div><div>```<br></div><div>Visit `http://127.0.0.1:5000/books` in your browser or use a tool like Postman to see the JSON response of the book list.<br></div><div><br></div><div>### Step 4: Implementing CRUD Operations<br></div><div>Expand the API to include POST, PUT, and DELETE methods:<br></div><div>- **POST**: Add a new book.<br></div><div>- **PUT**: Update an existing book by ID.<br></div><div>- **DELETE**: Remove a book by ID.<br></div><div><br></div><div>### Example Code for CRUD Operations<br></div><div>```python<br></div><div>@app.route('/books', methods=['POST'])<br></div><div>def add_book():<br></div><div>    new_book = request.get_json()<br></div><div>    books.append(new_book)<br></div><div>    return jsonify(new_book), 201<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['PUT'])<br></div><div>def update_book(book_id):<br></div><div>    book = next((b for b in books if b['id'] == book_id), None)<br></div><div>    if book:<br></div><div>        data = request.get_json()<br></div><div>        book.update(data)<br></div><div>        return jsonify(book)<br></div><div>    return jsonify({'error': 'Book not found'}), 404<br></div><div><br></div><div>@app.route('/books/<int:book_id>', methods=['DELETE'])<br></div><div>def delete_book(book_id):<br></div><div>    global books<br></div><div>    books = [b for b in books if b['id'] != book_id]<br></div><div>    return jsonify({'result': True})<br></div><div>```<br></div><div><br></div><div>## Conclusion<br></div><div><br></div><div>Building RESTful APIs is an essential skill for Python developers. By understanding the principles of REST and implementing a simple API using Flask, you can create robust applications that facilitate communication between different systems. In this lesson, you learned about the core concepts of RESTful APIs, their components, and how to implement CRUD operations. This foundational knowledge will serve you well as you tackle more complex projects in your journey to mastering Python.</div>	\N	\N	2	f	2026-02-20 16:27:49.32215	\N
429	114	8	Database Integration	<div>In this lesson on Database Integration, we will explore the essential concepts and practical applications of integrating databases with Python. This is a crucial skill for any developer, especially those looking to build robust applications that manage and manipulate data efficiently.<br></div><div><br></div><div>### 1. Understanding Databases<br></div><div>Databases are structured collections of data that allow for efficient storage, retrieval, and management. There are various types of databases, including:<br></div><div>- **Relational Databases** (e.g., MySQL, PostgreSQL): These use structured query language (SQL) for defining and manipulating data.<br></div><div>- **NoSQL Databases** (e.g., MongoDB, Cassandra): These are designed for unstructured data and provide flexibility in data modeling.<br></div><div><br></div><div>### 2. Why Integrate Databases with Python?<br></div><div>Python is a versatile programming language that provides numerous libraries and frameworks for database integration. The benefits include:<br></div><div>- **Ease of Use**: Python’s syntax is clean and easy to understand, making it simple to write database queries and handle data.<br></div><div>- **Rich Ecosystem**: With libraries like SQLAlchemy, Django ORM, and PyMongo, Python can interact with various database systems seamlessly.<br></div><div>- **Data Manipulation**: Python excels at data manipulation and analysis, making it a perfect companion for databases.<br></div><div><br></div><div>### 3. Setting Up Your Environment<br></div><div>Before diving into database integration, ensure you have the following tools installed:<br></div><div>- **Python**: Ensure you have Python 3.x installed on your system.<br></div><div>- **Database**: Install a relational database like MySQL or a NoSQL database like MongoDB.<br></div><div>- **Libraries**: Install necessary libraries using pip. For example, for MySQL, you would use:<br></div><div>  ```bash<br></div><div>  pip install mysql-connector-python<br></div><div>  ```<br></div><div><br></div><div>### 4. Connecting to a Database<br></div><div>To connect to a database, you need to establish a connection using Python. Here’s a basic example using MySQL:<br></div><div>```python<br></div><div>import mysql.connector<br></div><div><br></div><div># Establishing a connection<br></div><div>connection = mysql.connector.connect(<br></div><div>    host='localhost',<br></div><div>    user='your_username',<br></div><div>    password='your_password',<br></div><div>    database='your_database'<br></div><div>)<br></div><div><br></div><div># Checking the connection<br></div><div>if connection.is_connected():<br></div><div>    print('Connected to the database')<br></div><div>```<br></div><div><br></div><div>### 5. Executing Queries<br></div><div>Once connected, you can execute SQL queries to interact with the database. Here’s how to create a table and insert data:<br></div><div>```python<br></div><div>cursor = connection.cursor()<br></div><div><br></div><div># Creating a table<br></div><div>create_table_query = '''CREATE TABLE users (<br></div><div>    id INT AUTO_INCREMENT PRIMARY KEY,<br></div><div>    name VARCHAR(255) NOT NULL,<br></div><div>    email VARCHAR(255) NOT NULL UNIQUE<br></div><div>)'''  <br></div><div>cursor.execute(create_table_query)<br></div><div><br></div><div># Inserting data<br></div><div>insert_query = "INSERT INTO users (name, email) VALUES (%s, %s)"<br></div><div>user_data = ('John Doe', 'john@example.com')<br></div><div>cursor.execute(insert_query, user_data)<br></div><div>connection.commit()<br></div><div><br></div><div>print('Data inserted successfully')<br></div><div>```<br></div><div><br></div><div>### 6. Retrieving Data<br></div><div>Retrieving data from the database is straightforward. You can use SELECT queries to fetch data:<br></div><div>```python<br></div><div># Retrieving data<br></div><div>select_query = "SELECT * FROM users"<br></div><div>cursor.execute(select_query)<br></div><div>result = cursor.fetchall()<br></div><div><br></div><div>for row in result:<br></div><div>    print(row)<br></div><div>```<br></div><div><br></div><div>### 7. Closing the Connection<br></div><div>Always remember to close the connection to the database once your operations are complete:<br></div><div>```python<br></div><div>cursor.close()<br></div><div>connection.close()<br></div><div>```<br></div><div><br></div><div>### 8. Best Practices<br></div><div>- **Use Parameterized Queries**: Prevent SQL injection attacks by using parameterized queries instead of string concatenation.<br></div><div>- **Error Handling**: Implement error handling using try-except blocks to manage exceptions gracefully.<br></div><div>- **Connection Pooling**: For applications with high database traffic, consider using connection pooling for efficiency.<br></div><div><br></div><div>### 9. Real-World Project Example<br></div><div>In your upcoming real-world project, you will integrate a database with a Python web application. You will:<br></div><div>- Design a database schema for user management.<br></div><div>- Implement CRUD (Create, Read, Update, Delete) operations.<br></div><div>- Use an ORM for easier data manipulation.<br></div><div><br></div><div>### Conclusion<br></div><div>In this lesson, we covered the fundamental aspects of database integration using Python. Mastering these concepts will empower you to build data-driven applications and enhance your programming skills. In the next lesson, we will dive deeper into advanced database management techniques and explore how to optimize database performance.</div>	\N	\N	3	f	2026-02-20 16:27:49.325332	\N
430	114	8	Deploying Web Applications	<div><h1>Deploying Web Applications</h1><br></div><div><p>In the final lesson of our course, 'Masters in Python with 5 Real-World Projects', we delve into the crucial topic of deploying web applications. Deployment is the process of making your web application accessible to users over the internet. This lesson will guide you through the various methods, tools, and best practices for deploying Python web applications effectively.</p><br></div><div><br></div><div><h2>1. Understanding Deployment</h2><br></div><div><p>Deployment involves several steps, including preparing your application, choosing a hosting environment, and ensuring that your application runs smoothly in a production setting. It’s essential to understand that deployment is not just a one-time event; it requires ongoing maintenance and updates.</p><br></div><div><br></div><div><h2>2. Preparing Your Application for Deployment</h2><br></div><div><p>Before deploying, ensure that your application is production-ready. This includes:</p><br></div><div><ul><br></div><div>  <li><strong>Code Optimization:</strong> Refactor your code for performance, remove debug statements, and ensure that your code adheres to best practices.</li><br></div><div>  <li><strong>Configuration Management:</strong> Separate configuration settings (like database credentials) from your codebase using environment variables or configuration files.</li><br></div><div>  <li><strong>Testing:</strong> Conduct thorough testing, including unit tests, integration tests, and user acceptance testing to ensure your application behaves as expected.</li><br></div><div></ul><br></div><div><br></div><div><h2>3. Choosing a Hosting Environment</h2><br></div><div><p>There are several options for hosting your web application:</p><br></div><div><ul><br></div><div>  <li><strong>Shared Hosting:</strong> Cost-effective but limited in resources and control. Suitable for small applications.</li><br></div><div>  <li><strong>Virtual Private Servers (VPS):</strong> Offers more control and resources than shared hosting, allowing you to install custom software.</li><br></div><div>  <li><strong>Cloud Hosting:</strong> Services like AWS, Google Cloud, and Azure provide scalable resources and flexibility, ideal for growing applications.</li><br></div><div>  <li><strong>Platform as a Service (PaaS):</strong> Solutions like Heroku and PythonAnywhere simplify deployment by managing the infrastructure for you.</li><br></div><div></ul><br></div><div><br></div><div><h2>4. Deployment Tools and Technologies</h2><br></div><div><p>Utilizing the right tools can streamline your deployment process. Here are some popular options:</p><br></div><div><ul><br></div><div>  <li><strong>Docker:</strong> Containerization allows you to package your application with all its dependencies, ensuring consistency across different environments.</li><br></div><div>  <li><strong>Continuous Integration/Continuous Deployment (CI/CD):</strong> Tools like Jenkins, GitHub Actions, and Travis CI automate the testing and deployment process, reducing the chances of human error.</li><br></div><div>  <li><strong>Web Servers:</strong> Familiarize yourself with web servers like Nginx and Apache, which serve your application to users.</li><br></div><div></ul><br></div><div><br></div><div><h2>5. Best Practices for Deployment</h2><br></div><div><p>To ensure a successful deployment, adhere to these best practices:</p><br></div><div><ul><br></div><div>  <li><strong>Version Control:</strong> Use Git to manage your codebase, enabling you to track changes and collaborate effectively.</li><br></div><div>  <li><strong>Monitoring and Logging:</strong> Implement monitoring tools (like New Relic or Sentry) and logging practices to track your application’s performance and catch issues early.</li><br></div><div>  <li><strong>Backup and Recovery:</strong> Regularly back up your data and have a recovery plan in place to minimize downtime in case of failure.</li><br></div><div></ul><br></div><div><br></div><div><h2>6. Conclusion</h2><br></div><div><p>Deploying web applications is a vital skill for any Python developer. By understanding the deployment process, preparing your application, choosing the right hosting environment, utilizing effective tools, and following best practices, you can ensure that your web application is robust, scalable, and ready for users. As you embark on your deployment journey, remember that continuous learning and adaptation are key to mastering this essential aspect of web development.</p><br></div><div><br></div><div><p>In the next section, we will explore hands-on deployment exercises using popular platforms, allowing you to apply what you’ve learned in this lesson.</p></div>	\N	\N	4	f	2026-02-20 16:27:49.329457	\N
431	115	8	Project 1: Personal Finance Tracker	<div>### Introduction to Personal Finance Tracker<br></div><div>In today's fast-paced world, managing personal finances is crucial for achieving financial stability and success. This lesson focuses on creating a Personal Finance Tracker using Python, which will help you understand your income, expenses, savings, and investments better. By the end of this project, you will have a functional application that can assist you in making informed financial decisions.<br></div><div><br></div><div>### Project Overview<br></div><div>The Personal Finance Tracker will be a console-based application that allows users to:<br></div><div>1. **Track Income**: Users can input their sources of income and the amounts received.<br></div><div>2. **Record Expenses**: Users can categorize and record their expenses, helping them understand where their money goes.<br></div><div>3. **View Reports**: The application will generate reports that summarize income, expenses, and savings over a specified period.<br></div><div>4. **Set Budgets**: Users can set monthly budgets for different categories and receive alerts when they are nearing their limits.<br></div><div><br></div><div>### Learning Objectives<br></div><div>By completing this project, you will learn to:<br></div><div>- Use Python to create a command-line interface (CLI) application.<br></div><div>- Work with data structures like lists and dictionaries to manage financial data.<br></div><div>- Implement basic file handling to save and load user data.<br></div><div>- Utilize functions and modules to organize your code effectively.<br></div><div>- Gain insights into personal finance management and budgeting strategies.<br></div><div><br></div><div>### Step-by-Step Implementation<br></div><div>#### Step 1: Setting Up Your Environment<br></div><div>Before you start coding, ensure you have Python installed on your machine. You can download it from the official Python website. Additionally, you may want to use an Integrated Development Environment (IDE) like PyCharm or Visual Studio Code for better code management.<br></div><div><br></div><div>#### Step 2: Designing the Application<br></div><div>- **Define the Data Model**: Decide how you will structure your data. A simple approach could be:<br></div><div>  - `income`: A list of dictionaries, each containing `source` and `amount`.<br></div><div>  - `expenses`: A list of dictionaries, each containing `category`, `description`, and `amount`.<br></div><div>  - `budget`: A dictionary mapping categories to budget limits.<br></div><div><br></div><div>- **User Interface**: Plan how users will interact with your application. A simple text-based menu can be effective:<br></div><div>  - 1. Add Income<br></div><div>  - 2. Add Expense<br></div><div>  - 3. View Reports<br></div><div>  - 4. Set Budget<br></div><div>  - 5. Exit<br></div><div><br></div><div>#### Step 3: Implementing Functionality<br></div><div>- **Add Income**: Create a function that prompts the user for income details and appends them to the income list.<br></div><div>- **Add Expense**: Similar to income, create a function to record expenses.<br></div><div>- **Generate Reports**: Implement a function that calculates total income, total expenses, and savings, and displays them in a user-friendly format.<br></div><div>- **Set Budget**: Allow users to input budget limits for different categories and check against expenses.<br></div><div><br></div><div>#### Step 4: File Handling<br></div><div>To ensure user data is preserved between sessions, implement file handling:<br></div><div>- Use the `json` module to save income and expense data to a JSON file.<br></div><div>- Load this data when the application starts, allowing users to continue from where they left off.<br></div><div><br></div><div>#### Step 5: Testing and Debugging<br></div><div>Once your application is built, thoroughly test it to ensure all functionalities work as expected. Look for edge cases, such as negative income or expenses, and handle them appropriately.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing the Personal Finance Tracker project, you will not only enhance your Python programming skills but also gain valuable insights into managing your finances effectively. This project serves as a practical application of programming concepts while addressing a real-world need. As you progress through the course, remember that the skills you acquire here will be applicable in various domains, making you a versatile Python developer.<br></div><div><br></div><div>### Next Steps<br></div><div>After finishing this project, consider enhancing your tracker by adding features such as:<br></div><div>- Graphical user interface (GUI) using libraries like Tkinter or PyQt.<br></div><div>- Integration with online banking APIs for automatic transaction updates.<br></div><div>- Data visualization tools to represent financial data graphically.<br></div><div><br></div><div>Happy coding and good luck with your financial journey!</div>	\N	\N	1	t	2026-02-20 16:27:49.335417	\N
432	115	8	Project 2: Weather Forecast App	<div>In this lesson, we will embark on an exciting journey to create a Weather Forecast App using Python. This project is designed to deepen your understanding of Python programming while applying real-world concepts such as API integration, data handling, and user interface design. By the end of this project, you will have a fully functional application that retrieves and displays weather information based on user input.<br></div><div><br></div><div>### Objectives<br></div><div>- Understand how to interact with APIs to fetch real-time data.<br></div><div>- Learn to parse JSON data and extract relevant information.<br></div><div>- Develop a user-friendly interface using Python libraries.<br></div><div>- Implement error handling to manage API response issues.<br></div><div><br></div><div>### Project Overview<br></div><div>The Weather Forecast App will allow users to enter a city name and receive current weather conditions, including temperature, humidity, and a brief description of the weather. We will utilize the OpenWeatherMap API, which provides comprehensive weather data in a structured format.<br></div><div><br></div><div>### Step 1: Setting Up the Environment<br></div><div>Before we start coding, ensure you have the following installed:<br></div><div>- Python 3.x<br></div><div>- Requests library (for API calls)<br></div><div>- Tkinter (for GUI development)<br></div><div><br></div><div>You can install the Requests library using pip:<br></div><div>```bash<br></div><div>pip install requests<br></div><div>```<br></div><div><br></div><div>### Step 2: API Key Registration<br></div><div>1. Visit the [OpenWeatherMap website](https://openweathermap.org/api) and sign up for a free account.<br></div><div>2. Once registered, navigate to the API section and generate your API key. This key will be used to authenticate your requests.<br></div><div><br></div><div>### Step 3: Fetching Weather Data<br></div><div>Using the Requests library, we will make a GET request to the OpenWeatherMap API to retrieve weather data. Here’s a basic example:<br></div><div>```python<br></div><div>import requests<br></div><div><br></div><div>API_KEY = 'your_api_key'<br></div><div>BASE_URL = 'http://api.openweathermap.org/data/2.5/weather'<br></div><div><br></div><div>city_name = input('Enter city name: ')<br></div><div>complete_url = f'{BASE_URL}?q={city_name}&appid={API_KEY}&units=metric'<br></div><div><br></div><div>response = requests.get(complete_url)<br></div><div><br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    # Process the data<br></div><div>else:<br></div><div>    print('City not found')<br></div><div>```<br></div><div>In this code snippet, we construct the API URL with the user-provided city name and our API key. We then check if the response is successful and parse the JSON data.<br></div><div><br></div><div>### Step 4: Parsing the JSON Response<br></div><div>Once we receive the response, we need to extract relevant information. The JSON response contains various fields, but we are primarily interested in:<br></div><div>- Temperature<br></div><div>- Weather description<br></div><div>- Humidity<br></div><div><br></div><div>Here’s how we can extract this information:<br></div><div>```python<br></div><div>if response.status_code == 200:<br></div><div>    data = response.json()<br></div><div>    main = data['main']<br></div><div>    weather = data['weather'][0]<br></div><div>    temperature = main['temp']<br></div><div>    humidity = main['humidity']<br></div><div>    weather_description = weather['description']<br></div><div>    print(f'Temperature: {temperature}°C')<br></div><div>    print(f'Humidity: {humidity}%')<br></div><div>    print(f'Weather: {weather_description}')<br></div><div>```<br></div><div>### Step 5: Building the User Interface<br></div><div>Now that we can fetch and display weather data in the console, let’s create a graphical user interface (GUI) using Tkinter. Here’s a simple example to get you started:<br></div><div>```python<br></div><div>import tkinter as tk<br></div><div><br></div><div>def get_weather():<br></div><div>    # Fetch weather data and update the label<br></div><div>    pass<br></div><div><br></div><div>root = tk.Tk()<br></div><div>root.title('Weather Forecast App')<br></div><div><br></div><div>city_label = tk.Label(root, text='Enter city name:')<br></div><div>city_label.pack()<br></div><div><br></div><div>city_entry = tk.Entry(root)<br></div><div>city_entry.pack()<br></div><div><br></div><div>get_button = tk.Button(root, text='Get Weather', command=get_weather)<br></div><div>get_button.pack()<br></div><div><br></div><div>weather_info = tk.Label(root, text='Weather info will be displayed here')<br></div><div>weather_info.pack()<br></div><div><br></div><div>root.mainloop()<br></div><div>```<br></div><div>This code creates a simple window with an entry box for the city name, a button to fetch the weather, and a label to display the results.<br></div><div><br></div><div>### Step 6: Error Handling<br></div><div>To ensure a smooth user experience, implement error handling. If the API returns an error (e.g., city not found), display an appropriate message in the GUI instead of crashing the app.<br></div><div><br></div><div>### Conclusion<br></div><div>By completing this project, you will have gained practical experience in API usage, data parsing, and GUI development in Python. This Weather Forecast App not only showcases your programming skills but also serves as a foundation for more complex applications in the future. Remember to explore additional features, such as a forecast for multiple days or integrating maps to enhance your app further. Happy coding!</div>	\N	\N	2	f	2026-02-20 16:27:49.344883	\N
433	115	8	Project 3: Blog Platform	<div><h1>Project 3: Blog Platform</h1><br></div><div><p>Welcome to Project 3 of the <strong>Masters in Python with 5 Real-World Projects</strong>. In this project, you will design and implement a fully functional blog platform using Python. This project will help you solidify your understanding of web development concepts, database management, and the MVC (Model-View-Controller) architecture.</p><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The goal of this project is to create a blog platform where users can create, edit, delete, and view blog posts. You will also implement user authentication to manage user accounts, allowing for a personalized experience. By the end of this project, you will have a robust understanding of how to build web applications using Python frameworks.</p><br></div><div><br></div><div><h2>Key Features</h2><br></div><div><ul><br></div><div>  <li><strong>User Authentication:</strong> Implement sign-up, login, and logout functionality.</li><br></div><div>  <li><strong>CRUD Operations:</strong> Allow users to Create, Read, Update, and Delete blog posts.</li><br></div><div>  <li><strong>Commenting System:</strong> Enable users to comment on blog posts.</li><br></div><div>  <li><strong>Responsive Design:</strong> Ensure the platform is mobile-friendly and accessible.</li><br></div><div>  <li><strong>Search Functionality:</strong> Allow users to search for blog posts by title or content.</li><br></div><div></ul><br></div><div><br></div><div><h2>Technologies Used</h2><br></div><div><p>This project will utilize several technologies, including:</p><br></div><div><ul><br></div><div>  <li><strong>Python:</strong> The primary programming language for backend development.</li><br></div><div>  <li><strong>Flask or Django:</strong> A web framework to facilitate the development of the web application.</li><br></div><div>  <li><strong>SQLite or PostgreSQL:</strong> A database to store user and blog post data.</li><br></div><div>  <li><strong>HTML/CSS/JavaScript:</strong> For frontend development and creating a user-friendly interface.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Steps</h2><br></div><div><ol><br></div><div>  <li><strong>Set Up Your Environment:</strong> Install the necessary tools and libraries (Flask/Django, database connectors, etc.).</li><br></div><div>  <li><strong>Create the Database:</strong> Design the database schema to store users, posts, and comments.</li><br></div><div>  <li><strong>Implement User Authentication:</strong> Use libraries like Flask-Login or Django's built-in authentication to manage user sessions.</li><br></div><div>  <li><strong>Develop CRUD Functionality:</strong> Create routes and views for adding, editing, and deleting posts.</li><br></div><div>  <li><strong>Add Commenting System:</strong> Allow users to leave comments on blog posts and manage them.</li><br></div><div>  <li><strong>Design the User Interface:</strong> Use HTML and CSS to create a clean and engaging layout.</li><br></div><div>  <li><strong>Test the Application:</strong> Perform thorough testing to ensure all features work as intended.</li><br></div><div>  <li><strong>Deploy the Application:</strong> Use platforms like Heroku or DigitalOcean to host your blog platform.</li><br></div><div></ol><br></div><div><br></div><div><h2>Learning Outcomes</h2><br></div><div><p>Upon completing this project, you will have gained:</p><br></div><div><ul><br></div><div>  <li>A strong understanding of web application architecture.</li><br></div><div>  <li>Experience with user authentication and session management.</li><br></div><div>  <li>Skills in database design and management.</li><br></div><div>  <li>Proficiency in frontend and backend integration.</li><br></div><div>  <li>Knowledge of deploying web applications to cloud platforms.</li><br></div><div></ul><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>This blog platform project is a significant step in your journey to mastering Python and web development. It combines various essential skills and concepts that are critical for building real-world applications. Embrace the challenges, and enjoy the process of creating your own blog platform!</p></div>	\N	\N	3	f	2026-02-20 16:27:49.347734	\N
434	115	8	Project 4: E-commerce Website	<div>In this lesson, we will delve into Project 4 of the 'Masters in Python with 5 Real-World Projects' course, where you will create a fully functional e-commerce website. This project is designed to consolidate your Python skills while providing you with hands-on experience in web development. <br></div><div><br></div><div>### Introduction to E-commerce Websites<br></div><div>E-commerce websites facilitate online buying and selling of products and services. They are essential in today's digital economy, providing businesses with a platform to reach a global audience. In this project, you will learn how to build a robust e-commerce site using Python, Flask, and various other technologies.<br></div><div><br></div><div>### Objectives of the Project<br></div><div>By the end of this project, you will be able to:<br></div><div>1. **Understand the architecture of an e-commerce website**: Learn about the front-end and back-end components, including user interfaces, databases, and server-side logic.<br></div><div>2. **Implement user authentication**: Create secure login and registration systems for customers.<br></div><div>3. **Design a product catalog**: Build a dynamic catalog where users can browse products, filter by categories, and view detailed product information.<br></div><div>4. **Integrate a shopping cart**: Allow users to add, remove, and modify items in their shopping cart.<br></div><div>5. **Process payments securely**: Implement payment processing using APIs such as Stripe or PayPal.<br></div><div>6. **Deploy your website**: Learn how to host your e-commerce site on a cloud platform.<br></div><div><br></div><div>### Tools and Technologies Used<br></div><div>- **Python**: The primary programming language for backend development.<br></div><div>- **Flask**: A lightweight web framework that allows you to build web applications quickly.<br></div><div>- **HTML/CSS**: For structuring and styling the front-end of your website.<br></div><div>- **JavaScript**: To enhance user experience with interactive features.<br></div><div>- **SQLAlchemy**: For database management and ORM (Object Relational Mapping).<br></div><div>- **Bootstrap**: A front-end framework to design responsive web pages.<br></div><div>- **Stripe/PayPal API**: For secure payment processing.<br></div><div><br></div><div>### Project Structure<br></div><div>1. **Setting Up Your Environment**: Start by setting up a virtual environment and installing necessary libraries. Create a project folder structure that separates your static files, templates, and application logic.<br></div><div>2. **Creating the Database**: Use SQLAlchemy to define your database models for users, products, and orders. Establish relationships between these models to ensure data integrity.<br></div><div>3. **Building the Backend**: Develop the backend logic using Flask. Implement routes for user registration, login, product listing, and cart management. Ensure to handle errors and exceptions gracefully.<br></div><div>4. **Designing the Frontend**: Use HTML, CSS, and Bootstrap to create a user-friendly interface. Design pages for product listings, product details, cart, and checkout.<br></div><div>5. **Implementing User Authentication**: Use Flask-Login for managing user sessions and protecting routes that require authentication.<br></div><div>6. **Integrating Payment Processing**: Follow the documentation of your chosen payment processor to set up secure payment handling. Ensure to test transactions in a sandbox environment before going live.<br></div><div>7. **Testing Your Application**: Conduct thorough testing to identify and fix bugs. Consider both unit tests for individual components and integration tests for the entire application.<br></div><div>8. **Deployment**: Choose a cloud service provider (like Heroku, AWS, or DigitalOcean) to deploy your application. Ensure you configure the environment variables and database settings correctly.<br></div><div><br></div><div>### Conclusion<br></div><div>Completing this project will not only enhance your Python skills but will also give you a valuable portfolio piece that demonstrates your ability to build real-world applications. E-commerce is a booming field, and having practical experience in creating an e-commerce website will open doors for various career opportunities in web development and software engineering.<br></div><div><br></div><div>### Next Steps<br></div><div>As you embark on this project, remember to break it down into manageable tasks and set milestones to track your progress. Join forums or study groups to discuss challenges and share insights. Good luck, and enjoy the process of bringing your e-commerce vision to life!</div>	\N	\N	4	f	2026-02-20 16:27:49.350461	\N
435	115	8	Project 5: Data Analysis Dashboard	<div><h1>Project 5: Data Analysis Dashboard</h1><br></div><div><p>Welcome to Project 5 of the 'Masters in Python with 5 Real-World Projects' course! In this project, you will learn how to create a comprehensive Data Analysis Dashboard using Python. This dashboard will allow users to visualize and interact with data, making it easier to derive insights and make data-driven decisions.</p><br></div><div><br></div><div><h2>Objectives</h2><br></div><div><ul><br></div><div>    <li>Understand the fundamentals of data visualization.</li><br></div><div>    <li>Learn to use Python libraries such as Pandas, Matplotlib, and Plotly.</li><br></div><div>    <li>Build an interactive dashboard using Dash or Streamlit.</li><br></div><div>    <li>Implement data filtering and aggregation techniques.</li><br></div><div>    <li>Deploy your dashboard for real-world use.</li><br></div><div></ul><br></div><div><br></div><div><h2>Project Overview</h2><br></div><div><p>The primary goal of this project is to develop a Data Analysis Dashboard that can handle various datasets and present key metrics through interactive visualizations. You will work with real-world data, allowing you to apply the skills you have acquired throughout the course.</p><br></div><div><br></div><div><h2>Step-by-Step Guide</h2><br></div><div><h3>1. Data Acquisition</h3><br></div><div><p>Start by selecting a dataset relevant to your interests or industry. Popular sources include:</p><br></div><div><ul><br></div><div>    <li><a href='https://www.kaggle.com/'>Kaggle</a></li><br></div><div>    <li><a href='https://data.gov/'>Data.gov</a></li><br></div><div>    <li><a href='https://www.uci.edu/'>UCI Machine Learning Repository</a></li><br></div><div></ul><br></div><div><p>Once you have selected your dataset, download it in a suitable format (CSV, JSON, etc.).</p><br></div><div><br></div><div><h3>2. Data Preparation</h3><br></div><div><p>Utilize Pandas to clean and preprocess your data. This includes:</p><br></div><div><ul><br></div><div>    <li>Handling missing values.</li><br></div><div>    <li>Normalizing data formats.</li><br></div><div>    <li>Filtering out unnecessary columns.</li><br></div><div></ul><br></div><div><p>Ensure your data is ready for analysis by performing exploratory data analysis (EDA) to understand its structure and key features.</p><br></div><div><br></div><div><h3>3. Data Visualization</h3><br></div><div><p>Use Matplotlib and Plotly to create visualizations that represent your data effectively. Consider the following types of visualizations:</p><br></div><div><ul><br></div><div>    <li>Bar charts for categorical data.</li><br></div><div>    <li>Line graphs for trends over time.</li><br></div><div>    <li>Heatmaps for correlation matrices.</li><br></div><div></ul><br></div><div><p>Make sure your visualizations are clear, informative, and aesthetically pleasing.</p><br></div><div><br></div><div><h3>4. Building the Dashboard</h3><br></div><div><p>Choose a framework like Dash or Streamlit to create your interactive dashboard. Key components to include:</p><br></div><div><ul><br></div><div>    <li>Dropdowns for selecting data filters.</li><br></div><div>    <li>Sliders for adjusting parameters.</li><br></div><div>    <li>Graphs that update dynamically based on user input.</li><br></div><div></ul><br></div><div><p>Focus on user experience by ensuring that the dashboard is intuitive and responsive.</p><br></div><div><br></div><div><h3>5. Deployment</h3><br></div><div><p>Once your dashboard is complete, deploy it using platforms such as Heroku or Streamlit Sharing. This allows users to access your dashboard from anywhere, providing a real-world application of your project.</p><br></div><div><br></div><div><h2>Conclusion</h2><br></div><div><p>By the end of this project, you will have developed a fully functional Data Analysis Dashboard that showcases your ability to manipulate data, create visualizations, and build interactive applications using Python. This project not only enhances your technical skills but also prepares you for real-world data analysis challenges.</p><br></div><div><br></div><div><h2>Next Steps</h2><br></div><div><p>After completing this project, consider exploring additional features such as user authentication, advanced analytics, or integrating machine learning models to further enhance your dashboard's capabilities. The skills you gain here will be invaluable in your journey as a data professional.</p></div>	\N	\N	5	f	2026-02-20 16:27:49.354003	\N
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, course_id, title, description, order_index, created_at) FROM stdin;
1	1	Getting Started with HTML	Learn HTML basics	1	2026-01-08 14:08:46.363794
2	1	Styling with CSS	CSS fundamentals	2	2026-01-08 14:08:46.363794
3	1	JavaScript Essentials	JavaScript basics	3	2026-01-08 14:08:46.363794
4	1	Building Your First Website	Putting it all together	4	2026-01-08 14:08:46.363794
5	2	React Basics	Introduction to React	1	2026-01-08 14:08:46.363794
6	2	Components & Props	Building with components	2	2026-01-08 14:08:46.363794
7	2	State & Lifecycle	Managing state	3	2026-01-08 14:08:46.363794
8	2	Hooks Deep Dive	Modern React hooks	4	2026-01-08 14:08:46.363794
9	3	Generics Mastery	Advanced generics	1	2026-01-08 14:08:46.363794
10	3	Utility Types	Built-in utility types	2	2026-01-08 14:08:46.363794
11	3	Design Patterns in TS	Common patterns	3	2026-01-08 14:08:46.363794
12	3	Type-Safe Architecture	Building type-safe apps	4	2026-01-08 14:08:46.363794
13	4	Python Fundamentals	Python basics	1	2026-01-08 14:08:46.363794
14	4	NumPy for Numerical Computing	Working with arrays	2	2026-01-08 14:08:46.363794
15	4	Pandas for Data Analysis	DataFrames and analysis	3	2026-01-08 14:08:46.363794
16	4	Data Visualization	Charts and plots	4	2026-01-08 14:08:46.363794
17	5	Node.js Fundamentals	Node.js basics	1	2026-01-08 14:08:46.363794
18	5	Express.js Framework	Building with Express	2	2026-01-08 14:08:46.363794
19	5	Database Integration	MongoDB and SQL	3	2026-01-08 14:08:46.363794
20	5	Authentication & Security	Securing your API	4	2026-01-08 14:08:46.363794
21	6	AWS Fundamentals	Cloud basics	1	2026-01-08 14:08:46.363794
22	6	Compute Services	EC2 and Lambda	2	2026-01-08 14:08:46.363794
23	6	Storage & Databases	S3 and RDS	3	2026-01-08 14:08:46.363794
24	6	Infrastructure as Code	CloudFormation	4	2026-01-08 14:08:46.363794
100	11	UNTITLED CHAPTER		1	2026-02-20 16:27:28.439519
101	10	Introduction to Python		1	2026-02-20 16:27:35.311683
102	10	Advanced Python Concepts		2	2026-02-20 16:27:35.334892
103	10	Data Manipulation and Analysis		3	2026-02-20 16:27:35.353629
104	10	Web Development with Python		4	2026-02-20 16:27:35.375818
105	10	Capstone Projects		5	2026-02-20 16:27:35.416521
106	9	Introduction to Python		1	2026-02-20 16:27:42.747077
107	9	Advanced Python Concepts		2	2026-02-20 16:27:42.766012
108	9	Data Manipulation and Analysis		3	2026-02-20 16:27:42.784198
109	9	Web Development with Python		4	2026-02-20 16:27:42.807333
110	9	Capstone Projects		5	2026-02-20 16:27:42.824919
111	8	Introduction to Python		1	2026-02-20 16:27:49.267589
112	8	Advanced Python Concepts		2	2026-02-20 16:27:49.28517
113	8	Data Manipulation and Analysis		3	2026-02-20 16:27:49.302043
114	8	Web Development with Python		4	2026-02-20 16:27:49.316607
115	8	Capstone Projects		5	2026-02-20 16:27:49.33195
\.


--
-- Data for Name: pricing_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_plans (id, name, subtitle, price, period, coins, coins_label, icon_name, features, not_included, cta, href, button_variant, popular, order_index, is_active, created_at, updated_at) FROM stdin;
3	Pro	Most Popular	₹499	/ month	6,000	per month	Crown	["6,000 coins / month","Unlimited AI Usha","All labs, tests & projects","Unlimited course access","Certificates + Marksheets","Priority support","Progress analytics"]	[]	Go Pro	/signup	default	t	2	t	2026-02-19 16:35:21.847127	2026-02-19 16:35:21.847127
4	Elite	Institution	₹999	/ month	15,000	per month	Building2	["15,000 coins / month","Everything in Pro","Advanced projects","Career guidance sessions","Placement readiness","Dedicated account manager","Custom learning paths"]	[]	Contact Sales	/signup	outline	f	3	t	2026-02-19 16:35:21.847127	2026-02-19 16:35:21.847127
2	Basic	Learner	₹199	/ month	2,000	per month	Zap	["2,000 coins / month","Full AI Usha access","All practice labs & tests","5 course access","Course completion certificate","Email support"]	[]	Upgrade	/signup	outline	f	0	t	2026-02-19 16:35:21.847127	2026-02-19 16:48:10.878
1	Free	Starter	₹0		500	one-time	Gift	["500 coins (one-time bonus)","Limited AI Usha usage","Practice labs (basic)","1 course access","Community support"]	["No certificate generation"]	Start Free	/signup	outline	f	1	t	2026-02-19 16:35:21.847127	2026-02-19 16:48:10.88
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, course_id, title, description, difficulty, requirements, resources, estimated_hours, created_at) FROM stdin;
1	1	Personal Portfolio Website	Build a responsive personal portfolio website showcasing your skills and projects.	beginner	["Create a responsive navigation bar","Add a hero section with your introduction","Include a projects section with at least 3 project cards","Add a contact form","Make the site mobile-responsive"]	["MDN Web Docs","CSS Tricks Flexbox Guide","Google Fonts"]	8	2026-01-08 14:11:30.152333
2	2	Task Management App	Build a React task management application with CRUD operations.	intermediate	["Create components for task list and task items","Implement add, edit, delete functionality","Use useState and useEffect hooks","Add task filtering (all, completed, pending)","Persist data to localStorage"]	["React Documentation","TanStack Query Docs","Tailwind CSS"]	12	2026-01-08 14:11:30.152333
3	3	Type-Safe API Client	Build a fully type-safe API client library using advanced TypeScript patterns.	advanced	["Create generic request/response types","Implement type-safe route definitions","Add error handling with discriminated unions","Create utility types for API responses","Write comprehensive type tests"]	["TypeScript Handbook","Axios Documentation","Type Challenges"]	10	2026-01-08 14:11:30.152333
4	4	Data Analysis Dashboard	Create a data analysis project using Python, Pandas, and visualization libraries.	beginner	["Load and clean a dataset using Pandas","Perform exploratory data analysis","Create at least 5 different visualizations","Generate statistical summaries","Export results to a report"]	["Pandas Documentation","Matplotlib Gallery","Kaggle Datasets"]	15	2026-01-08 14:11:30.152333
5	5	RESTful API with Authentication	Build a complete REST API with user authentication and database integration.	intermediate	["Set up Express server with proper structure","Implement user registration and login","Add JWT authentication middleware","Create CRUD endpoints for a resource","Connect to MongoDB or PostgreSQL"]	["Express.js Guide","JWT.io","MongoDB Documentation"]	14	2026-01-08 14:11:30.152333
6	6	Serverless Web Application	Deploy a serverless web application using AWS services.	advanced	["Create Lambda functions for backend logic","Set up API Gateway endpoints","Use S3 for static website hosting","Implement DynamoDB for data storage","Configure CloudFormation templates"]	["AWS Lambda Developer Guide","Serverless Framework","AWS SAM"]	20	2026-01-08 14:11:30.152333
7	9	Build a Personal Expense Tracker with Data Visualization	In this project, students will develop a personal expense tracker application using Python that allows users to input, store, and analyze their daily expenses. The application will include features such as adding expense entries with categories, dates, and amounts, updating and deleting records, and summarizing expenses over custom time periods. Students will work with file handling or a lightweight database like SQLite to persist data.\n\nBeyond data management, students will integrate data visualization libraries like Matplotlib or Seaborn to generate insightful charts and graphs. These visualizations will help users understand their spending habits, identify trends, and make better financial decisions. This project combines concepts of file/database operations, object-oriented programming, user input handling, and data visualization, providing a comprehensive intermediate-level experience relevant to real-world application development.	medium	• Implement functionality to add, edit, and delete expense entries with fields: date, category, description, and amount\n• Persist expense data using either file storage (e.g., JSON, CSV) or SQLite database\n• Provide summary reports that calculate total expenses by category and time period\n• Create at least three types of visualizations (e.g., pie chart for category distribution, bar chart for monthly expenses, line chart for expense trends)\n• Design a simple command-line or minimal GUI interface for user interaction\n• Handle input validation and error management gracefully\n• Write modular, well-documented code using functions and classes	• Python official documentation: https://docs.python.org/3/\n• SQLite3 module documentation: https://docs.python.org/3/library/sqlite3.html\n• Matplotlib tutorial: https://matplotlib.org/stable/tutorials/index.html\n• Seaborn tutorial: https://seaborn.pydata.org/tutorial.html\n• JSON and CSV file handling tutorials: https://realpython.com/python-json/ and https://realpython.com/python-csv/\n• Python OOP concepts: https://realpython.com/python3-object-oriented-programming/	8	2026-02-19 17:14:07.031213
8	9	Enterprise-Grade Scalable Microservices Platform with Python	In this capstone project, students will design and implement a production-ready, scalable microservices platform using Python. The project simulates a real-world enterprise scenario where multiple microservices communicate asynchronously and synchronously, handle high throughput, and ensure data consistency across distributed components. Students will incorporate advanced architectural patterns such as API Gateway, service discovery, circuit breakers, and event-driven messaging to build a robust system that can scale horizontally.\n\nBeyond the core application, students will implement end-to-end security best practices including OAuth2 authentication, role-based access control, secure secret management, and protection against common vulnerabilities. Performance optimizations will be critical, requiring profiling and caching strategies. The project also involves setting up a full CI/CD pipeline with automated testing (unit, integration, and contract tests), linting, containerization with Docker, orchestration with Kubernetes, and monitoring/logging solutions. Comprehensive documentation and API specifications will ensure maintainability and ease of collaboration, making this a portfolio-defining project for any senior Python developer or team lead.	hard	• Design and implement at least three distinct Python microservices with clear separation of concerns\n• Use asynchronous messaging (e.g., RabbitMQ or Kafka) alongside RESTful APIs for inter-service communication\n• Implement an API Gateway to route requests, enforce rate limiting, and handle authentication\n• Integrate OAuth2-based authentication and role-based access control across services\n• Secure secrets and sensitive configurations using environment variables or vault solutions\n• Implement circuit breakers and retries to ensure fault tolerance\n• Optimize performance using profiling tools and implement caching mechanisms (e.g., Redis)\n• Containerize all services using Docker and define Kubernetes manifests for deployment\n• Set up a CI/CD pipeline using tools like GitHub Actions, Jenkins, or GitLab CI for automated testing, linting, building, and deployment\n• Write comprehensive unit, integration, and contract tests achieving high code coverage\n• Implement centralized logging and monitoring using ELK stack, Prometheus, or similar tools\n• Provide detailed documentation including architecture diagrams, API specs (OpenAPI/Swagger), setup instructions, and developer guides\n• Demonstrate scalability by simulating load and horizontal scaling in Kubernetes\n• Ensure the system handles graceful shutdowns and supports rolling updates	• Official Python documentation (https://docs.python.org/3/)\n• FastAPI or Flask for RESTful API development\n• Celery or asyncio for asynchronous task handling\n• RabbitMQ (https://www.rabbitmq.com/) or Kafka (https://kafka.apache.org/) for messaging\n• OAuth2 and OpenID Connect specifications (https://oauth.net/2/)\n• Docker documentation (https://docs.docker.com/)\n• Kubernetes official docs (https://kubernetes.io/docs/)\n• Prometheus (https://prometheus.io/) and Grafana (https://grafana.com/) for monitoring\n• ELK Stack (Elasticsearch, Logstash, Kibana) for logging\n• Pytest for testing (https://docs.pytest.org/)\n• GitHub Actions or Jenkins for CI/CD pipelines\n• OpenAPI Specification for API documentation (https://swagger.io/specification/)\n• Python profiling tools like cProfile and py-spy\n• Vault by HashiCorp for secrets management (https://www.vaultproject.io/)	35	2026-02-19 17:28:03.493154
9	4	Enterprise-Grade Scalable Data Pipeline and Analytics Platform with Python	In this capstone project, students will design and implement a highly scalable, production-ready data pipeline and analytics platform using Python, simulating an end-to-end data science solution for a large enterprise. The solution must ingest, process, analyze, and visualize massive datasets in near real-time, demonstrating mastery of data engineering, machine learning, and software development best practices. Students will face complex architecture decisions involving distributed systems, cloud integration, and container orchestration to ensure fault tolerance, scalability, and maintainability.\n\nBeyond building core data processing and modeling components, students will implement rigorous security measures including data encryption, authentication, and role-based access control. They will optimize performance using parallel processing, caching, and efficient algorithms. Additionally, students will design and set up a CI/CD pipeline with automated testing, linting, and deployment to a cloud environment. Comprehensive documentation and unit, integration, and load testing strategies will showcase their ability to deliver production-grade software suitable for real-world enterprise deployment. This project will push students to integrate advanced data science skills with software engineering excellence, preparing them for senior developer or team lead roles.	hard	• Architect and implement a distributed data ingestion pipeline capable of processing streaming and batch data using Python frameworks (e.g., Apache Kafka, Apache Airflow, or equivalent)\n• Build scalable data transformation and feature engineering modules optimized for performance and memory efficiency\n• Develop and train machine learning models on processed data, incorporating hyperparameter tuning and model versioning\n• Create interactive dashboards and visualizations using Python libraries (e.g., Dash, Plotly, or Streamlit) for data exploration and reporting\n• Design and implement robust security measures including encrypted data storage, secure API endpoints with authentication and authorization, and compliance with data privacy best practices\n• Optimize the entire system for scalability and fault tolerance using containerization (Docker), orchestration (Kubernetes), and cloud services (AWS, GCP, or Azure)\n• Set up a full CI/CD pipeline integrating linting, unit/integration/load testing (including performance benchmarks), and automated deployment to the cloud\n• Write comprehensive documentation covering system architecture, setup instructions, API specifications, testing strategies, and user guides\n• Implement extensive testing coverage: unit tests for individual components, integration tests for pipeline stages, and load testing to validate system scalability and reliability	• Apache Kafka official documentation for streaming data ingestion\n• Apache Airflow tutorials for pipeline orchestration\n• Scikit-learn and TensorFlow/PyTorch for machine learning modeling\n• Docker and Kubernetes official guides for containerization and orchestration\n• Cloud provider documentation (AWS/GCP/Azure) for deployment and security best practices\n• Python testing frameworks: pytest, unittest, and locust for load testing\n• Security best practices: OWASP API Security Top 10 and data encryption methods\n• Dash, Plotly, and Streamlit documentation for building interactive visualizations\n• CI/CD tools: GitHub Actions, Jenkins, or GitLab CI/CD tutorials\n• System design and architecture resources for scalable distributed systems	35	2026-02-20 14:03:32.554236
\.


--
-- Data for Name: shishya_ai_nudge_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_ai_nudge_logs (id, user_id, course_id, nudge_type, message, channel, rule_id, is_read, sent_at) FROM stdin;
\.


--
-- Data for Name: shishya_course_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_course_enrollments (id, user_id, course_id, credits_paid, enrolled_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	1	0	2026-01-08 08:53:05.970049
2	deb463f3-4431-4b02-b547-f928bdef8f5a	8	100	2026-02-18 18:27:37.797565
3	4607aea1-23dd-448e-9f57-dc9286a1f12e	9	100	2026-02-19 12:42:16.105881
4	faa56bd4-3892-4243-93be-4c7eb9d74b29	10	100	2026-02-20 13:36:58.891494
5	faa56bd4-3892-4243-93be-4c7eb9d74b29	9	100	2026-02-20 13:37:46.829755
\.


--
-- Data for Name: shishya_credit_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_credit_transactions (id, user_id, amount, type, reason, description, reference_id, balance_after, created_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	500	BONUS	WELCOME_BONUS	Welcome bonus for new users	\N	500	2026-01-08 08:10:06.839256
2	deb463f3-4431-4b02-b547-f928bdef8f5a	-100	DEBIT	COURSE_ENROLLMENT	Enrolled in course #8	8	400	2026-02-18 18:27:37.793559
3	4607aea1-23dd-448e-9f57-dc9286a1f12e	500	BONUS	WELCOME_BONUS	Welcome bonus for new users	\N	500	2026-02-19 12:38:13.686058
4	4607aea1-23dd-448e-9f57-dc9286a1f12e	-100	DEBIT	COURSE_ENROLLMENT	Enrolled in course #9	9	400	2026-02-19 12:42:16.102339
5	faa56bd4-3892-4243-93be-4c7eb9d74b29	500	BONUS	WELCOME_BONUS	Welcome bonus for new users	\N	500	2026-02-20 13:30:23.237097
6	faa56bd4-3892-4243-93be-4c7eb9d74b29	-100	DEBIT	COURSE_ENROLLMENT	Enrolled in course #10	10	400	2026-02-20 13:36:58.878007
7	faa56bd4-3892-4243-93be-4c7eb9d74b29	-100	DEBIT	COURSE_ENROLLMENT	Enrolled in course #9	9	300	2026-02-20 13:37:46.826521
8	98a51791-0082-4e1f-95d4-86abfb9093d6	500	BONUS	WELCOME_BONUS	Welcome bonus for new users	\N	500	2026-02-25 11:26:43.625358
\.


--
-- Data for Name: shishya_gift_boxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_gift_boxes (id, sender_id, recipient_email, points, payment_id, status, claimed_by, created_at, claimed_at) FROM stdin;
\.


--
-- Data for Name: shishya_marksheet_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_marksheet_verifications (id, marksheet_id, verifier_ip, verifier_user_agent, verified_at) FROM stdin;
\.


--
-- Data for Name: shishya_marksheets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_marksheets (id, marksheet_id, user_id, student_name, student_email, program_name, academic_year, course_data, total_marks, obtained_marks, percentage, grade, cgpa, result, classification, total_credits, courses_completed, reward_coins, scholarship_eligible, verification_code, pdf_hash, signed_by, ai_verifier_name, issued_at, expires_at, status) FROM stdin;
\.


--
-- Data for Name: shishya_motivation_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_motivation_cards (id, card_id, user_id, course_id, course_title, card_type, title, subtitle, badge, stats, message, percentile_rank, is_shareable, share_url, view_count, created_at) FROM stdin;
\.


--
-- Data for Name: shishya_motivation_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_motivation_rules (id, name, description, rule_type, conditions, actions, priority, cooldown_hours, max_trigger_count, is_active, is_global, course_id, created_at, updated_at) FROM stdin;
1	First Lesson Completed	Reward when student completes their first lesson	milestone	[{"field":"lessonsCompleted","operator":"eq","value":1}]	[{"type":"add_coins","value":10},{"type":"send_nudge","value":"celebration","message":"Congratulations on completing your first lesson!"}]	100	0	1	t	t	\N	2026-01-08 04:07:30.110614	2026-01-08 04:07:30.110614
2	5 Lessons Milestone	Reward when student completes 5 lessons	milestone	[{"field":"lessonsCompleted","operator":"eq","value":5}]	[{"type":"add_coins","value":25},{"type":"generate_card","value":"milestone","message":"You've completed 5 lessons!"}]	90	0	1	t	t	\N	2026-01-08 04:07:30.137343	2026-01-08 04:07:30.137343
3	10 Lessons Champion	Reward when student completes 10 lessons	milestone	[{"field":"lessonsCompleted","operator":"gte","value":10}]	[{"type":"add_coins","value":50},{"type":"generate_card","value":"dedication","message":"10 lessons completed! Amazing dedication!"},{"type":"create_mystery_box"}]	85	0	1	t	t	\N	2026-01-08 04:07:30.154136	2026-01-08 04:07:30.154136
4	3-Day Streak	Reward for maintaining a 3-day learning streak	streak	[{"field":"streakCount","operator":"eq","value":3}]	[{"type":"add_coins","value":15},{"type":"send_nudge","value":"streak"}]	80	72	\N	t	t	\N	2026-01-08 04:07:30.164462	2026-01-08 04:07:30.164462
5	7-Day Streak Champion	Reward for maintaining a 7-day learning streak	streak	[{"field":"streakCount","operator":"eq","value":7}]	[{"type":"add_coins","value":50},{"type":"generate_card","value":"streak","message":"One week of consistent learning!"},{"type":"create_mystery_box"}]	75	168	\N	t	t	\N	2026-01-08 04:07:30.170971	2026-01-08 04:07:30.170971
6	Comeback Hero	Welcome back students after 3+ days of inactivity	comeback	[{"field":"daysSinceLastActivity","operator":"gte","value":3}]	[{"type":"add_coins","value":20},{"type":"send_nudge","value":"comeback","message":"Welcome back! Here's a bonus to get you started again!"}]	70	72	5	t	t	\N	2026-01-08 04:07:30.177287	2026-01-08 04:07:30.177287
7	Test Ace	Reward for scoring 90%+ on a test	performance	[{"field":"testScore","operator":"gte","value":90}]	[{"type":"add_coins","value":30},{"type":"generate_card","value":"performance","message":"Exceptional test performance!"}]	65	24	\N	t	t	\N	2026-01-08 04:07:30.182751	2026-01-08 04:07:30.182751
8	First Certificate	Celebrate earning the first certificate	milestone	[{"field":"certificatesEarned","operator":"eq","value":1}]	[{"type":"add_coins","value":100},{"type":"generate_card","value":"completion","message":"Your first course certificate! Amazing achievement!"},{"type":"create_mystery_box"}]	100	0	1	t	t	\N	2026-01-08 04:07:30.186129	2026-01-08 04:07:30.186129
9	Project Submitter	Reward for submitting a project	progress	[{"field":"projectsSubmitted","operator":"gte","value":1}]	[{"type":"add_coins","value":20},{"type":"send_nudge","value":"celebration","message":"Great job on submitting your project!"}]	60	24	\N	t	t	\N	2026-01-08 04:07:30.192135	2026-01-08 04:07:30.192135
10	Halfway There	Encourage students at 50% course progress	progress	[{"field":"courseProgressPercent","operator":"gte","value":50},{"field":"courseProgressPercent","operator":"lt","value":60}]	[{"type":"add_coins","value":20},{"type":"send_nudge","value":"progress","message":"You're halfway there! Keep going!"}]	55	0	1	t	t	\N	2026-01-08 04:07:30.197203	2026-01-08 04:07:30.197203
\.


--
-- Data for Name: shishya_mystery_boxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_mystery_boxes (id, box_id, user_id, rule_id, reward_type, reward_value, is_opened, opened_at, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: shishya_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_notifications (id, user_id, role, title, message, type, link, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: shishya_otp_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_otp_codes (id, user_id, otp_hash, expires_at, used, attempts, created_at) FROM stdin;
\.


--
-- Data for Name: shishya_otp_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_otp_logs (id, user_id, contact_type, destination, otp_hash, purpose, attempt_count, expires_at, consumed_at, created_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	email	venkateshmoorthy96@gmail.com	1d148e14bfb04ad30a40ce6d79e430868aab7abd0cecda952874ab78c6bec593	signup	0	2026-01-08 08:14:33.536	2026-01-08 08:10:06.771	2026-01-08 08:09:33.537468
2	4607aea1-23dd-448e-9f57-dc9286a1f12e	email	venkateshnarayanan49@gmail.com	afd15af8a18833a8294f8a335b73ef6d36035fd5b09c13f362ab29d1a07a049d	signup	0	2026-02-19 12:42:43.97	2026-02-19 12:38:13.665	2026-02-19 12:37:43.971065
3	11e93cbd-d769-42ba-8b2d-256abca650aa	email	iyyappansivamarimuthu@gmial.com	73f9abc25f60a7b145391c591c8360417500ac680fb79fc2cda6d304a924b783	signup	0	2026-02-20 13:33:26.751	\N	2026-02-20 13:28:26.75252
4	faa56bd4-3892-4243-93be-4c7eb9d74b29	email	iyyappansivamarimuthu@gmail.com	5181635ec3f74a443d93add591514017f0644a4dc2e812f4776078b62b43c926	signup	0	2026-02-20 13:34:46.047	2026-02-20 13:30:22.985	2026-02-20 13:29:46.050878
5	\N	email	ourshiksha.guru@gmail.com_dishabrooms@gmail.com	db12e05a82c7343a35c1a7bf083494e41daca810fbdc08bfef9992cee7277b28	guru_signup	0	2026-02-25 11:25:26.81	2026-02-25 11:20:59.344	2026-02-25 11:20:26.810742
6	1c40cc66-5b11-466f-ab0e-0e50e2ee5474	email	dishabbrooms.invoices@gmail.com	8a54e4d5e9f02c08eed3c1f8ef9b1c6ee0ccd0783479cbf2cd1e8b86f759bf91	signup	0	2026-02-25 11:28:00.55	\N	2026-02-25 11:23:00.551181
7	98a51791-0082-4e1f-95d4-86abfb9093d6	email	dishabrooms.invoices@gmail.com	6fb04758922cda1023a958e131fea2fd841ba1eb93f45a193b087904e120c8b4	signup	0	2026-02-25 11:30:28.59	2026-02-25 11:26:43.56	2026-02-25 11:25:28.592757
\.


--
-- Data for Name: shishya_rule_trigger_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_rule_trigger_logs (id, rule_id, user_id, course_id, trigger_count, actions_executed, input_signals, triggered_at) FROM stdin;
\.


--
-- Data for Name: shishya_scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_scholarships (id, scholarship_id, name, description, discount_percent, course_id, max_redemptions, redemption_count, valid_from, valid_until, rule_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: shishya_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_sessions (id, user_id, created_at, expires_at) FROM stdin;
a069d247-754c-4fe4-8fcd-8b5f097a0a12	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 08:10:06.852656	2026-01-15 08:10:06.852
d61b3b63-8d87-48b3-84c0-5a4da1c4b829	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 09:16:50.379158	2026-01-15 09:16:50.377
34c6844c-e228-4be1-b37e-3d4532f1653e	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 11:34:54.555402	2026-01-15 11:34:54.553
4fe72c6c-1890-49bf-bc02-bc2523c35113	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 11:36:53.137545	2026-01-15 11:36:53.136
9da56747-6151-4644-b510-6d68cf75c83c	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 11:39:34.72424	2026-01-15 11:39:34.722
f1187f8d-5025-4b6e-be59-21876b124160	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 11:42:23.634592	2026-01-15 11:42:23.632
274c0fbd-0f44-46da-8805-712a84e97ab8	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 12:30:49.325584	2026-01-15 12:30:49.323
c003b170-e96c-44c9-9b8a-9c4561a4d007	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 12:33:26.669352	2026-01-15 12:33:26.667
4b1240d4-7f5f-4767-b557-5f507aa4743f	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 12:48:52.74648	2026-01-15 12:48:52.744
075d6b0c-c0df-4edd-94a6-3eb0a934f3b0	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 12:49:03.533098	2026-01-15 12:49:03.529
e25380be-a73e-4688-a7b3-b1652470d3cf	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 12:52:53.614451	2026-01-15 12:52:53.612
746f3a4b-5bfd-4f4b-acb4-cf7b812a5a99	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:23:52.183535	2026-01-15 13:23:52.182
199fedf0-14c0-4d92-9fab-0febace2bd0f	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:26:52.923375	2026-01-15 13:26:52.92
882707ed-263e-4260-a3aa-7cad68d23012	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:30:19.032848	2026-01-15 13:30:19.031
564e886c-061f-4703-881d-fcaec11995fe	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:34:11.725243	2026-01-15 13:34:11.723
9ef98e8a-0a28-4762-97ac-4b10c82f1b9a	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:54:18.910773	2026-01-15 13:54:18.909
37606713-426b-4741-9ecf-507273dfe62b	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 13:57:08.687991	2026-01-15 13:57:08.686
7d764373-b50c-4ed4-8c86-ceb41326c042	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-08 14:01:30.270516	2026-01-15 14:01:30.267
38b62ee9-8a51-47ae-a90c-bfec7dd6b942	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-01-25 12:17:03.809121	2026-02-01 12:17:03.808
19e13c14-f0e1-4c5a-8f80-c499ce44ad50	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-02-03 07:19:29.970006	2026-02-10 07:19:29.967
e77f08ea-0baa-47e0-a320-b69c219d5785	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-02-19 08:45:18.032251	2026-02-26 08:45:18.031
4913c74b-f5bc-4672-aa5e-014af8543428	4607aea1-23dd-448e-9f57-dc9286a1f12e	2026-02-19 12:38:13.719744	2026-02-26 12:38:13.694
a885fb6f-04b0-4c5a-b09a-3a049fdcf7df	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-02-19 17:39:04.701377	2026-02-26 17:39:04.7
cf790bf5-e4e8-484c-83d8-a22317112103	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-02-23 16:56:36.643429	2026-03-02 16:56:36.642
e76615e8-6b04-4c5c-bb5a-b29679423b6b	deb463f3-4431-4b02-b547-f928bdef8f5a	2026-02-24 14:23:55.738645	2026-03-03 14:23:55.736
\.


--
-- Data for Name: shishya_student_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_student_streaks (id, user_id, current_streak, longest_streak, last_activity_date, streak_start_date, total_active_days, updated_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_certificates (id, user_id, certificate_id, course_id, course_title, certificate_title, certificate_type, level, skills, issued_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_credits (id, user_id, balance, total_earned, total_spent, created_at, updated_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	400	500	100	2026-01-08 08:10:06.832996	2026-02-18 18:27:37.788
2	4607aea1-23dd-448e-9f57-dc9286a1f12e	400	500	100	2026-02-19 12:38:13.679747	2026-02-19 12:42:16.097
3	faa56bd4-3892-4243-93be-4c7eb9d74b29	300	500	200	2026-02-20 13:30:23.231346	2026-02-20 13:37:46.822
4	98a51791-0082-4e1f-95d4-86abfb9093d6	500	500	0	2026-02-25 11:26:43.619015	2026-02-25 11:26:43.619015
\.


--
-- Data for Name: shishya_user_lab_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_lab_progress (id, user_id, course_id, lab_id, completed, user_code, completed_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_profiles (id, user_id, full_name, username, bio, profile_photo, headline, location, github_url, linkedin_url, portfolio_visible, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_progress (id, user_id, course_id, lesson_id, completed_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_project_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_project_submissions (id, user_id, project_id, course_id, github_url, live_url, notes, submitted_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_scholarships (id, user_id, scholarship_id, course_id, is_used, used_at, awarded_at, expires_at) FROM stdin;
\.


--
-- Data for Name: shishya_user_test_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_user_test_attempts (id, user_id, test_id, course_id, answers, score_percentage, passed, attempted_at) FROM stdin;
\.


--
-- Data for Name: shishya_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_users (id, email, password_hash, email_verified, created_at, auth_provider, auth_provider_id) FROM stdin;
deb463f3-4431-4b02-b547-f928bdef8f5a	venkateshmoorthy96@gmail.com	$2b$12$tLrIqWc0xycXNOcfy96GIO20NpQQSHAbXSHQ9iGcvuO7RgUg3RObe	t	2026-01-08 08:09:33.526006	email	\N
4607aea1-23dd-448e-9f57-dc9286a1f12e	venkateshnarayanan49@gmail.com	$2b$12$4btGLholAuBW6E3Ms0HRTexdbPjijNuWmzNZRQRMLWzbKosY5wDoO	t	2026-02-19 12:37:43.591274	email	\N
11e93cbd-d769-42ba-8b2d-256abca650aa	iyyappansivamarimuthu@gmial.com	$2b$12$1R62Rqe/IjE8MoppOx1Y7ur0UMQM3uDK/zV.7ketEHHyBkIXImImK	f	2026-02-20 13:28:26.714405	email	\N
faa56bd4-3892-4243-93be-4c7eb9d74b29	iyyappansivamarimuthu@gmail.com	$2b$12$DWWrmFHFzMgAGh9nU6GCfeAczU53KmFeBbUp4HcV8RIPFJY6YJmIC	t	2026-02-20 13:29:45.956649	email	\N
1c40cc66-5b11-466f-ab0e-0e50e2ee5474	dishabbrooms.invoices@gmail.com	$2b$12$VVoNxV1nLOb924CM3f28/e2e9TZIyo5Id8Af2NNXDt2rBQMSYIUZK	f	2026-02-25 11:23:00.5172	email	\N
98a51791-0082-4e1f-95d4-86abfb9093d6	dishabrooms.invoices@gmail.com	$2b$12$1.4hqQgNLU/cz5HEhdc0bueWDniJdj3NT26ivzTEEUVCWXN7M18Y2	t	2026-02-25 11:25:28.572508	email	\N
\.


--
-- Data for Name: shishya_usha_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_usha_conversations (id, user_id, course_id, page_type, created_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	1	lesson	2026-01-08 10:07:40.409864
2	deb463f3-4431-4b02-b547-f928bdef8f5a	1	lab	2026-01-08 10:49:31.216719
3	deb463f3-4431-4b02-b547-f928bdef8f5a	0	general	2026-02-19 19:28:22.24763
\.


--
-- Data for Name: shishya_usha_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_usha_messages (id, conversation_id, role, content, response_type, help_level, created_at) FROM stdin;
1	1	user	hi	\N	\N	2026-01-08 10:07:40.599092
2	1	assistant	Hello! It’s great to see you here. How can I help you with your learning today? Is there a particular topic or subject you want to explore?	explanation	detailed	2026-01-08 10:07:40.599092
3	1	user	Hi	\N	\N	2026-01-08 10:11:13.890546
4	1	assistant	Hello! It’s great to see you here. How can I help you with your learning today? Is there a particular topic or concept you want to explore together?	explanation	detailed	2026-01-08 10:11:13.890546
5	1	user	explain me the lesson	\N	\N	2026-01-08 10:11:46.896125
6	1	assistant	Of course! To help you best, could you please tell me which lesson or topic you want me to explain? That way, I can break it down step-by-step and make it easier to understand. \n\nFor example, is it about math, science, programming, or something else? And if you have any specific part of the lesson that feels confusing, let me know! \n\nLooking forward to your reply so we can explore the lesson together. What topic are you working on?	explanation	detailed	2026-01-08 10:11:46.896125
7	1	user	hi who are you	\N	\N	2026-01-08 10:15:25.11999
8	1	assistant	Hello! I am Usha, your AI Tutor Avatar here to help you learn and understand your subjects better. Think of me as a calm and patient guide who will explain ideas clearly and help you think through problems step by step. I’m here to encourage your learning, not just give quick answers. \n\nWhat would you like to learn or explore today?	explanation	detailed	2026-01-08 10:15:25.11999
9	1	user	hi buddy	\N	\N	2026-01-08 10:28:33.203376
10	1	assistant	Hello! Since you have the lesson "What is HTML?" open, feel free to ask any questions about it. I'm here to help you understand HTML step by step. What would you like to know?	explanation	detailed	2026-01-08 10:28:33.203376
11	1	user	which my last video	\N	\N	2026-01-08 10:28:54.788129
12	1	assistant	You are currently watching the lesson titled "What is HTML?" If you want, I can help explain any part of this lesson or answer your questions about HTML. Just let me know!	explanation	detailed	2026-01-08 10:28:54.788129
13	1	user	explain	\N	\N	2026-01-08 10:29:10.243134
14	1	assistant	Great! In this lesson, "What is HTML?", let's start step by step.\n\nHTML stands for HyperText Markup Language. Think of it as the skeleton or structure of a webpage. Just like a house needs a frame to hold walls and rooms, a webpage needs HTML to organize its content like text, images, and links.\n\nHTML uses small pieces called "tags" to tell the browser how to display content. For example, <p> tags create paragraphs, and <a> tags create links.\n\nWould you like me to explain how these tags work or how a simple HTML page is built? Keep asking—you're doing well exploring!	explanation	detailed	2026-01-08 10:29:10.243134
15	1	user	explain	\N	\N	2026-01-08 10:29:36.831476
16	1	assistant	நன்றாக கேள்வி! இந்த பாடத்தில், HTML என்பது "HyperText Markup Language" என்பதன் சுருக்கம். இது வலைப்பக்கங்களை உருவாக்க பயன்படுத்தப்படும் மொழி. \n\nHTML-ல், நாம் ஒரு புத்தகத்தில் அத்தியாயங்களை பிரிக்க 사용하는 தலைப்புகள் போல, வலைப்பக்கத்தில் உள்ள பகுதிகளை பிரிக்க "tags" (குறிச்சொற்கள்) பயன்படுத்துகிறோம். உதாரணமாக, <p> என்பது ஒரு பத்தியை (paragraph) குறிக்கிறது.\n\nஇது ஒரு கட்டுமானம் போல: HTML என்பது கட்டடத்தின் அடித்தளம்; tags என்பது அந்த கட்டடத்தின் சுவர்கள், கதவுகள், ஜன்னல்கள்.\n\nநீங்கள் மேலும் கேள்விகள் இருந்தால் கேளுங்கள், நான் விளக்க உதவுகிறேன்!	explanation	detailed	2026-01-08 10:29:36.831476
17	2	user	what is anwer	\N	\N	2026-01-08 10:49:31.23845
18	2	assistant	Hello! I'm Usha, your AI teacher here to help you understand the lesson step by step. To assist you better, please start the lesson or let me know which topic or question you want to learn about. Whenever you're ready, just play the lesson or ask me about it.	explanation	detailed	2026-01-08 10:49:31.23845
19	2	user	teach this	\N	\N	2026-01-08 10:50:36.097548
20	2	assistant	Hello! I'm Usha, your AI teacher here to guide you through this lesson step by step. To begin, please start the lesson by playing the video or interacting with the content. Once you do, I’ll be happy to help explain concepts and answer your questions. Just let me know when you're ready!	explanation	detailed	2026-01-08 10:50:36.097548
21	2	user	Explain this lab	\N	\N	2026-01-08 10:51:09.178127
22	2	assistant	Hello! I'm Usha, your AI teacher here to guide you step by step once you start the lesson. To help you with this lab, please play the lesson or begin interacting with the content. When you do, I can explain the lab details and support your learning. Let me know when you're ready!	explanation	detailed	2026-01-08 10:51:09.178127
23	2	user	can explain this	\N	\N	2026-01-08 10:59:36.307072
24	2	assistant	Sure! Please tell me which part you want me to explain. If you share the specific problem or concept from the lab, I can break it down step by step and give you hints or pseudocode to help you solve it.	hint	detailed	2026-01-08 10:59:36.307072
25	2	user	Variables and Output\nBeginner\n5 min\nJavaScript\nObjective\nPractice declaring variables and printing output to the console.\n\nInstructions\n1\nDeclare a variable called 'greeting' and set it to 'Hello, World!'\n2\nDeclare a variable called 'number' and set it to 42\n3\nUse console.log() to print the greeting\n4\nUse console.log() to print the number	\N	\N	2026-01-08 11:00:02.167201
26	2	assistant	Hello! I'm Usha, your AI teacher. I'll help you understand this lesson step by step once you start. Whenever you're ready, play the lesson or ask me about it.	explanation	detailed	2026-01-08 11:00:02.167201
27	2	user	see i have solved	\N	\N	2026-01-08 11:03:51.043162
28	2	assistant	Hello! I'm Usha, your AI teacher here to help you with this lesson. Whenever you start the lesson video or interact with the content, I can assist you step by step. Feel free to play the lesson or ask me any questions about it when you're ready.	explanation	detailed	2026-01-08 11:03:51.043162
29	2	user	hey hi	\N	\N	2026-01-08 11:09:50.132828
30	2	assistant	Hey there! I’m Usha, your friendly learning companion here to help you explore and understand whatever you’re working on. Whether you want to chat, ask questions, or dive into a lesson or lab, I’m here for you. Whenever you’re ready, just let me know what you want to learn or try, and we’ll get started together! How does that sound?	explanation	detailed	2026-01-08 11:09:50.132828
31	2	user	i completed the code but explain	\N	\N	2026-01-08 11:10:36.758008
32	2	assistant	Hey, great job finishing your code! I’d love to help you understand it better. Could you tell me a bit about what your code does or share the part you want me to explain? That way, I can break it down step-by-step and make it super clear for you. \n\nThink of your code like a recipe — if you tell me the ingredients and steps you used, I can help explain why each part is there and how it all works together. What do you say?	explanation	detailed	2026-01-08 11:10:36.758008
33	2	user	Array Methods - Filter\nIntermediate\n\nJavaScript\nObjective\nPractice using the filter method to select elements.\n\nInstructions\n1\nGiven the numbers array [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n2\nUse filter() to create 'evenNumbers' containing only even numbers\n3\nLog the evenNumbers array	\N	\N	2026-01-08 11:11:29.895424
34	2	assistant	Hey there! I’m Usha, your friendly learning companion. I’m here to help you understand and practice JavaScript concepts like the filter method, step by step.\n\nThis lab is about using the `filter()` method to pick out even numbers from an array. When you’re ready, you can start by thinking about how `filter()` works — it takes a function that decides whether each element should be included or not.\n\nWould you like me to help you break down how to write that filter function for even numbers? Or do you want to give it a try first? Just let me know!	explanation	detailed	2026-01-08 11:11:29.895424
35	2	user	can you tell the answers	\N	\N	2026-01-08 11:12:12.179754
36	2	assistant	Hey there! I’m Usha, your friendly learning companion here to help you understand and explore concepts step by step. I’m really excited to work with you and guide you through the learning process.\n\nInstead of just giving you the answers, I’d love to help you think through the problems together. That way, you’ll understand them deeply and feel confident solving similar questions on your own. How about we start by looking at the problem you’re working on? You can tell me what it’s about, and we’ll figure it out together! How does that sound?	explanation	detailed	2026-01-08 11:12:12.179754
37	1	user	How are you, Usha?	\N	\N	2026-01-08 12:35:35.420092
38	1	assistant	I'm doing well, thank you! I'm here and ready to explore the world of HTML with you. How are you feeling about the lesson? Is there anything specific on your mind?	guidance	detailed	2026-01-08 12:35:35.420092
39	1	user	What is HTML?	\N	\N	2026-01-08 12:36:13.995154
40	1	assistant	HTML, or HyperText Markup Language, is the standard language used to create and design webpages. Think of it as the foundation or skeleton of a webpage — it structures and organizes content so that browsers can display it correctly.\n\n### Let's break it down:\n\n1. **Markup Language**: HTML is called a "markup language" because it uses tags to annotate text, images, and other content. These tags tell the browser how to display the content. For instance, a tag can indicate that a piece of text should be a heading, a paragraph, or a link.\n\n2. **Elements**: The basic building blocks of HTML are called elements. An HTML element usually consists of:\n   - **Opening Tag**: Indicates the start of an element (e.g., `<h1>` for a heading).\n   - **Content**: The text or other elements contained within the tags (e.g., "Welcome to My Website!").\n   - **Closing Tag**: Indicates the end of an element (e.g., `</h1>`).\n\n   So, a full heading element might look like this: `<h1>Welcome to My Website!</h1>`.\n\n3. **Attributes**: HTML elements can have attributes that provide additional information. For example, an image element can have a `src` attribute that specifies the image's location. An example is: `<img src="image.jpg" alt="Description of image">`.\n\n4. **Structure**: A typical HTML document has a specific structure:\n   - **`<!DOCTYPE html>`**: Declares the document type and version of HTML.\n   - **`<html>`**: The root element that wraps all content.\n   - **`<head>`**: Contains meta-information about the document, like the title and links to stylesheets.\n   - **`<body>`**: Contains the actual content that is displayed on the webpage, such as text, images, and links.\n\n### Analogy:\nYou can think of HTML like the framework of a house. The walls, roof, and rooms are all structured in a way that allows you to move around and use the space. Similarly, HTML structures the content of a webpage, allowing browsers to render it as a coherent and visually appealing site.\n\n### Why is HTML important?\nHTML is essential because it lays the groundwork for everything you see on the web. Without it, there would be no structure for browsers to interpret and display content. It’s	explanation	detailed	2026-01-08 12:36:13.995154
41	1	user	How are you, Usha?	\N	\N	2026-01-08 12:38:42.60598
42	1	assistant	I'm here and feeling connected, thank you for asking! How about you? How's your journey with learning HTML going?	guidance	detailed	2026-01-08 12:38:42.60598
43	1	user	musth ekdam badiyaa	\N	\N	2026-01-08 12:39:09.399899
44	1	assistant	I'm glad to hear that you're feeling great! It’s always nice to have a positive vibe. 😊 \n\nNow, since we're diving into HTML, do you have any questions or specific areas you'd like to explore? Or would you like a brief overview of what HTML is and its importance? Let’s keep that good energy flowing!	explanation	detailed	2026-01-08 12:39:09.399899
45	1	user	you eat a goodday	\N	\N	2026-01-08 12:39:46.26556
46	1	assistant	It sounds like you're mentioning "Good Day," which is a popular biscuit brand! If you're enjoying some, I hope they're as delightful as they sound. \n\nDo you want to share more about your favorite snacks or maybe even what you're doing today? I'm here to chat!	explanation	detailed	2026-01-08 12:39:46.26556
47	1	user	How are you, Usha?	\N	\N	2026-01-08 12:49:48.454053
48	1	assistant	I'm feeling quite present and ready to support you! How about you? How is your journey through learning about HTML going? It's such an exciting topic! Shall we dive back into it together?	guidance	detailed	2026-01-08 12:49:48.454053
49	1	user	I just want to chat	\N	\N	2026-01-08 12:50:41.339028
50	1	assistant	Of course! I'm here for whatever you need. What's on your mind? Anything particular you’d like to talk about, or should we just see where the conversation takes us?	explanation	detailed	2026-01-08 12:50:41.339028
51	1	user	I just want to chat, I'm feeling lazy today	\N	\N	2026-01-08 12:53:37.084563
52	1	assistant	That's totally okay! We all have those days when we just want to relax and chat. It's important to take a break sometimes and just be in the moment. What's on your mind? Anything in particular you’d like to talk about? \n\nAnd whenever you're ready, I'm here to explore your lesson on HTML with you!	explanation	detailed	2026-01-08 12:53:37.084563
53	1	user	How are you doing Usha?	\N	\N	2026-01-08 12:54:13.461096
54	1	assistant	I'm doing well, thank you! I'm here and ready to support you. How about you? Are you feeling good about diving into your lesson on HTML? There's so much to explore together!	guidance	detailed	2026-01-08 12:54:13.461096
55	1	user	What is HTML?	\N	\N	2026-01-08 12:54:46.804479
84	2	assistant	I understand how frustrating it can be when your code isn't working as expected. Let’s take a moment to figure this out together! \n\nSince you're working on the "Basic Math Operations" lab, could you share a bit about what you've written so far? What specific errors or issues are you encountering? \n\nRemember, debugging is a part of the learning process, and it's okay to stumble a bit! Let's break it down step by step. \n\nAnd by the way, once we tackle this, we can dive deeper into those math operations! What do you think?	explanation	detailed	2026-01-08 13:40:16.588076
85	2	user	What's the best approach here?	\N	\N	2026-01-08 13:40:51.565981
56	1	assistant	HTML, or HyperText Markup Language, is the standard language used to create and design web pages. Think of it as the skeleton of a webpage — it provides the structure and tells the browser how to display content.\n\n1. **Markup Language**: HTML uses "tags" to define elements on a page. For example:\n   - `<h1>` for headings\n   - `<p>` for paragraphs\n   - `<a>` for links\n\n2. **Elements and Attributes**: An element in HTML is made up of a start tag, content, and an end tag. For example, `<p>This is a paragraph.</p>`. You can also add attributes to elements to provide more information. For example, `<a href="https://www.example.com">Click here</a>` includes an "href" attribute that defines the link's destination.\n\n3. **Structure**: HTML documents have a basic structure that includes:\n   - `<!DOCTYPE html>`: Declares the document type.\n   - `<html>`: The root element.\n   - `<head>`: Contains meta-information about the document (like its title).\n   - `<body>`: Contains the content that will be displayed on the webpage.\n\n4. **Hyperlinks**: One of the powerful features of HTML is the ability to create hyperlinks, allowing users to navigate from one page to another simply by clicking.\n\nTo visualize it, imagine you’re building a house. HTML defines the rooms (elements), the walls (tags), and how everything fits together to create a comfortable space (the webpage).\n\nIs there a specific part of HTML that you’d like to dive deeper into? I’m here to help you explore!	explanation	detailed	2026-01-08 12:54:46.804479
57	1	user	Explain this simply	\N	\N	2026-01-08 13:04:21.319265
58	1	assistant	Absolutely! HTML, or HyperText Markup Language, is the basic building block of web pages. Think of it like the skeleton of a house. Just as a skeleton gives structure to a house, HTML provides structure to a web page.\n\nHere are a few key points to help you understand it better:\n\n1. **Tags**: HTML uses "tags" to define different parts of a web page. These tags are enclosed in angle brackets, like `<tagname>`. For example, `<p>` is a tag for a paragraph.\n\n2. **Elements**: An HTML element consists of a start tag, content, and an end tag. So, if you want to create a paragraph that says "Hello, World!", you'd write:\n   ```html\n   <p>Hello, World!</p>\n   ```\n\n3. **Attributes**: Tags can have attributes that provide additional information. For instance, if you wanted to add a link, you’d use the `<a>` tag (for anchor) with an `href` attribute to specify the destination:\n   ```html\n   <a href="https://www.example.com">Visit Example</a>\n   ```\n\n4. **Hierarchy**: HTML documents are structured hierarchically. This means you can have elements nested within other elements, just like a family tree. For instance, you might have a `<div>` (a division or section) that contains several `<p>` elements.\n\n5. **Rendering**: Finally, when a web browser reads the HTML code, it renders it into a visual format that users can see and interact with.\n\nDoes that make sense? It’s all about creating a framework for your content! \n\nNow, shall we explore more about HTML elements or dive into creating your first web page together? I'm excited to learn with you!	explanation	detailed	2026-01-08 13:04:21.319265
59	1	user	how to print 42	\N	\N	2026-01-08 13:04:48.659176
60	1	assistant	To print the number 42 in a programming context, it usually involves using a command specific to the programming language you're working with. For example:\n\n1. **In Python**: You would write:\n   ```python\n   print(42)\n   ```\n   This command tells Python to display the number 42 on the screen.\n\n2. **In Java**: It looks like this:\n   ```java\n   System.out.println(42);\n   ```\n   Here, `System.out.println` is the command used to print output in Java.\n\n3. **In JavaScript**: You would use:\n   ```javascript\n   console.log(42);\n   ```\n   This tells the browser's console to show the number 42.\n\n4. **In HTML**: You would generally display numbers like this:\n   ```html\n   <p>42</p>\n   ```\n   Here, 42 is placed inside a paragraph tag, which will display it on a webpage.\n\nEach programming language has its own syntax for printing values, but the core idea is the same: you're instructing the computer to display that value.\n\nNow, since we’re talking about HTML, would you like to dive deeper into how HTML works, or do you want to explore something else related to programming? I'm excited to learn with you!	guidance	detailed	2026-01-08 13:04:48.659176
61	2	user	expli this simply	\N	\N	2026-01-08 13:05:40.728444
62	2	assistant	Hello! I'm Usha, your learning companion. I'm here to guide you, support you, and explore new ideas together. Think of me as someone who can help you understand concepts better and make learning enjoyable.\n\nIf you're ready, let’s dive into your lesson! What topic are you interested in exploring today? I'm excited to learn with you!	explanation	detailed	2026-01-08 13:05:40.728444
63	2	user	"Can you explain this concept?"	\N	\N	2026-01-08 13:12:31.969839
64	2	assistant	Of course! I’d love to help you understand the concept better. Could you please let me know which specific concept you’re curious about? That way, I can tailor my explanation to fit your needs perfectly. \n\nAnd once we dive into that, we can explore it step by step together! What concept do you want to tackle?	explanation	detailed	2026-01-08 13:12:31.969839
65	2	user	Explain this concept with an example	\N	\N	2026-01-08 13:25:02.192244
66	2	assistant	Of course! I’d love to help clarify the concept for you. Could you please specify which concept you’re referring to? Once I know that, I can provide a detailed explanation with an example that makes it easier to understand. \n\nAnd while we’re at it, is there a particular part of your lesson you’d like to explore more deeply together?	explanation	detailed	2026-01-08 13:25:02.192244
67	2	user	Explain this concept with an example	\N	\N	2026-01-08 13:27:45.440748
68	2	assistant	I’d love to help! Since we're in a lab context, could you let me know what the main focus of your current lab is? That way, I can give you a clear and relevant example. \n\nOnce I know, I can explain the concept in a way that makes sense and is easy to understand. Let’s dive into it together!	explanation	detailed	2026-01-08 13:27:45.440748
69	2	user	Explain this concept with an example	\N	\N	2026-01-08 13:31:24.943019
70	2	assistant	It seems you're looking for some clarity on a concept related to your lab in "Introduction to Web Development." Since I don't have the specific context of your current lab, let’s talk about a fundamental concept in web development: **HTML elements**.\n\nThink of an HTML document as a house. Each room in the house serves a different purpose — the kitchen for cooking, the living room for relaxing, and so on. In the same way, HTML elements are like rooms that structure your webpage, each serving a specific function.\n\nFor example:\n- The `<h1>` element is like the front door of your house; it’s the first thing visitors see, representing the main title of your page.\n- The `<p>` element is like a cozy corner in the living room where you can sit and read; it contains paragraphs of text that provide information to your visitors.\n\nWhen you put these elements together, you create a complete page, just like how different rooms come together to form a house.\n\nNow, can you think of other HTML elements and their purposes? Or is there a particular part of your lab you'd like to explore further? I'm excited to learn with you!	explanation	detailed	2026-01-08 13:31:24.943019
71	2	user	Explain this concept with an example	\N	\N	2026-01-08 13:35:11.004897
72	2	assistant	Absolutely! Since we’re focusing on "Variables and Output," let's break down the concept of variables first.\n\nThink of a variable like a labeled box that you can use to store things. For example, if you have a box labeled "age," you can put your age inside that box. Whenever you need to know your age, you just look inside the "age" box. \n\nIn programming, a variable can hold different types of data — numbers, text, or even more complex data types. \n\nHere's a simple analogy:\n- **Variable**: A labeled box (like "age").\n- **Contents of the box**: The actual data (like the number 25).\n- **Output**: If you want to show your age, you open the "age" box and display what’s inside.\n\nFor example, in a programming language like JavaScript, you might declare a variable like this:\n\n```javascript\nlet age = 25; // Here, 'age' is the variable that holds the value 25.\nconsole.log(age); // This outputs the value inside the 'age' variable to the console.\n```\n\nIn this case, `let age = 25;` creates a variable called `age` and assigns it the value of 25. When you use `console.log(age);`, it outputs the value stored in `age` (which is 25) to the console.\n\nNow, how do you think you could use variables to store and output different kinds of information? Let’s explore that together! What part of variables and output would you like to dive deeper into?	guidance	detailed	2026-01-08 13:35:11.004897
73	2	user	Give me a hint for this step	\N	\N	2026-01-08 13:36:49.506231
74	2	assistant	Of course! Could you let me know which specific step you need a hint for in the "Basic Math Operations" lab? I'm here to help you figure it out!	hint	detailed	2026-01-08 13:36:49.506231
75	2	user	start to end	\N	\N	2026-01-08 13:37:14.398854
76	2	assistant	It sounds like you're looking for a comprehensive overview of the "Basic Math Operations" lab. Let's break it down step by step!\n\n1. **Understanding Basic Math Operations**: \n   - The four primary operations are addition, subtraction, multiplication, and division. Each of these can be performed using variables in your code.\n\n2. **Variables**: \n   - Think of a variable like a labeled box where you can store values. For example, you can create variables to hold numbers that you want to use in your math operations. \n   - Example: `let a = 5;`, `let b = 3;`\n\n3. **Performing Operations**: \n   - You can use these variables to perform math:\n     - **Addition**: `let sum = a + b;` (This adds the values in `a` and `b`.)\n     - **Subtraction**: `let difference = a - b;` (This subtracts `b` from `a`.)\n     - **Multiplication**: `let product = a * b;` (This multiplies `a` and `b`.)\n     - **Division**: `let quotient = a / b;` (This divides `a` by `b`.)\n\n4. **Outputting Results**: \n   - To see the results of your operations, you can use `console.log()`. \n   - Example: `console.log("Sum: " + sum);` will print the sum to the console.\n\n5. **Practice**: \n   - Try creating two variables and performing all four operations with them. \n   - You could even change the values of the variables and see how the results change!\n\nRemember, coding is like solving a puzzle; each operation is a piece that fits together to create the final picture. \n\nNow, are you ready to dive into this lab? What specific part would you like to explore further? I'm here to help you!	guidance	detailed	2026-01-08 13:37:14.398854
77	2	user	what is the answer	\N	\N	2026-01-08 13:37:59.089043
78	2	assistant	It seems like you're looking for an answer, but I need a bit more context to help you out. Are you working on a specific problem or question from your "Basic Math Operations" lab? \n\nRemember, it's all about understanding the concepts! If you can share what you're working on or what you're trying to find out, I can guide you through it. Let's figure this out together! \n\nSo, what part of the lab or math operation are you focusing on?	explanation	detailed	2026-01-08 13:37:59.089043
79	2	user	"Basic Math Operations"  answer	\N	\N	2026-01-08 13:38:56.711842
80	2	assistant	It sounds like you're diving into some interesting concepts with "Basic Math Operations"! In this lab, you’re likely exploring how to perform fundamental arithmetic operations like addition, subtraction, multiplication, and division using code.\n\nLet's break it down a bit:\n\n1. **Addition**: This is simply combining two numbers. Think of it like putting two apples in a basket; if you had one apple and then added another, you'd have two.\n\n2. **Subtraction**: This is removing one number from another. If you have three apples and you take away one, you’re left with two.\n\n3. **Multiplication**: This is like repeated addition. For example, if you have five bags with three apples in each, instead of adding three apples five times, you can just multiply 5 by 3 to get 15 apples.\n\n4. **Division**: This is splitting a number into equal parts. If you have 12 apples and want to share them equally among four friends, you’d divide 12 by 4, which gives you 3 apples per friend.\n\nIn programming, you typically use symbols for these operations:\n- Addition is `+`\n- Subtraction is `-`\n- Multiplication is `*`\n- Division is `/`\n\nWould you like to explore how to implement these operations in code, or do you have specific questions about them? \n\nNow, shall we explore your lesson together? I'm excited to learn with you!	explanation	detailed	2026-01-08 13:38:56.711842
81	2	user	Help me understand the logic	\N	\N	2026-01-08 13:39:53.109506
82	2	assistant	Of course! Let's break down the logic behind basic math operations, which is what your lab is focusing on. \n\nIn programming, basic math operations include addition, subtraction, multiplication, and division. These operations allow us to manipulate numbers and perform calculations. Here’s a simple way to think about each operation:\n\n1. **Addition (+)**: Imagine you have a basket of apples. If you add 3 apples to your basket, and you already had 2, you can think of it like this: \n   - **2 (existing apples) + 3 (new apples) = 5 apples**.\n   - In code, you would write something like `total = existing_apples + new_apples`.\n\n2. **Subtraction (-)**: If you eat 1 apple from your basket of 5 apples, you would calculate how many you have left:\n   - **5 (starting apples) - 1 (eaten apple) = 4 apples remaining**.\n   - In code, it would look like `remaining = total_apples - eaten_apples`.\n\n3. **Multiplication (×)**: Think of this as repeated addition. If you have 3 baskets, and each basket has 4 apples, you can find the total apples by multiplying:\n   - **3 (baskets) × 4 (apples per basket) = 12 apples**.\n   - In programming, this would be `total_apples = baskets * apples_per_basket`.\n\n4. **Division (÷)**: If you want to share 12 apples among 3 friends equally, you'd divide:\n   - **12 (total apples) ÷ 3 (friends) = 4 apples per friend**.\n   - In code, it looks like `apples_per_friend = total_apples / friends`.\n\nNow that we've covered the basic math operations, think about how these can be represented in your code. \n\nAs you implement these in your lab, consider what variables you might need (like `total_apples`, `eaten_apples`, etc.) and how you'll perform each operation step by step. \n\nWhat part of this logic would you like to explore more deeply? Or is there a specific operation you're facing challenges with? I'm here to help! \n\nAnd whenever you're ready, I'm here to explore your lesson with you!	explanation	detailed	2026-01-08 13:39:53.109506
83	2	user	Why is my code not working?	\N	\N	2026-01-08 13:40:16.588076
86	2	assistant	It sounds like you're looking for guidance on how to tackle the lab on "Basic Math Operations." A good approach is to break down the tasks into smaller, manageable steps. \n\n1. **Understand the Basics**: Make sure you're clear on the different math operations you'll be working with, such as addition, subtraction, multiplication, and division.\n\n2. **Plan Your Code**: Think about how you want to structure your code. For example, you might want to start by defining your variables first — these are like containers where you store your numbers.\n\n3. **Use Functions**: If your lab allows for functions, consider creating separate functions for each math operation. This way, you can keep your code organized and reusable.\n\n4. **Test Each Part**: As you write your code, test each operation one at a time. This will help you catch any errors early on.\n\n5. **Put It All Together**: Once you have each part working, combine them to create a complete solution.\n\nWould you like to dive deeper into any specific part of this approach, or do you have a particular question about the math operations? I'm here to help!\n\nAnd by the way, your lesson on "Basic Math Operations" is waiting! Want to tackle it together?	guidance	detailed	2026-01-08 13:40:51.565981
87	2	user	Help me with this lab	\N	\N	2026-01-08 13:55:12.788039
88	2	assistant	Of course! I'm here to help you with your lab on "Variables and Output" in JavaScript. Let's get started! \n\nCan you tell me what specific part you're working on right now or if you have any particular questions? We can break it down step by step together. Remember, I'm right here with you! \n\nYou're doing great! Try asking: "What do I need to declare a variable in JavaScript?"	explanation	detailed	2026-01-08 13:55:12.788039
89	2	user	Help me with this lab	\N	\N	2026-01-08 13:57:54.638779
90	2	assistant	I'd love to help! This lab is about practicing with variables and output in JavaScript. Let's start with step 1 — you need to declare a variable. In JavaScript, you can use `let` or `const` to create a variable, which you can think of like a labeled box that holds a value. \n\nFor example, if you want to create a variable that stores your name, you might write:\n\n```javascript\nlet name = "Usha";\n```\n\nThis declares a variable called `name` and assigns it the value "Usha". \n\nOnce you've declared your variable, the next step is to output its value. You can use `console.log()` for that. \n\nYou're making great progress! Consider asking: "How do I use console.log to print my variable?"	explanation	detailed	2026-01-08 13:57:54.638779
91	2	user	Help me get started	\N	\N	2026-01-08 14:02:05.997312
92	2	assistant	I'm excited to help you get started! This lab is all about practicing how to declare variables and print output to the console using JavaScript. \n\nLet's begin with step 1: you need to declare a variable called `greeting` and set it to the string "Hello, World!". In JavaScript, you can use `let` or `const` to declare a variable. \n\nHere's a little analogy: think of a variable like a labeled box that can hold a note with a message. In this case, the note inside your box (the variable) will say "Hello, World!".\n\nSo, your code for this step would look something like this:\n\n```javascript\nconst greeting = "Hello, World!";\n```\n\nOnce you have that down, we can move on to step 2, where you'll declare another variable called `number` and set it to `42`. \n\nYou're doing great! After you try this, let me know, and we can continue together. How about asking yourself: "What do I need to do for step 2?"	hint	detailed	2026-01-08 14:02:05.997312
93	2	user	What's the first step?	\N	\N	2026-01-08 14:02:27.383584
94	2	assistant	I'm glad you're eager to get started! Let's dive into this lab on declaring variables and printing output to the console. The first step is to declare a variable called `greeting` and set it to the string `'Hello, World!'`. \n\nIn JavaScript, you can declare a variable using `let` or `const`. Think of a variable as a labeled box that holds a value. Here’s how you can do it:\n\n```javascript\nlet greeting = 'Hello, World!';\n```\n\nOnce you've done that, we can move on to the next step. You're doing great! \n\nNow, what do you think comes next in the instructions? "How do I declare and print my second variable?"	explanation	detailed	2026-01-08 14:02:27.383584
95	1	user	explain the concept	\N	\N	2026-02-14 16:57:52.258937
96	1	assistant	Absolutely! Let's dive into HTML, which stands for HyperText Markup Language. It's the standard language used to create web pages. Think of HTML as the skeleton of a webpage — it gives structure and form to the content.\n\n### Key Concepts of HTML:\n\n1. **Elements**: These are the building blocks of HTML. An element usually consists of a start tag, some content, and an end tag. For example:\n   ```html\n   <p>This is a paragraph.</p>\n   ```\n   Here, `<p>` is the start tag, and `</p>` is the end tag. The text "This is a paragraph." is the content.\n\n2. **Tags**: Tags are used to define elements. They are enclosed in angle brackets. There are two types of tags:\n   - **Opening Tag**: Indicates the beginning of an element (e.g., `<h1>` for a top-level heading).\n   - **Closing Tag**: Indicates the end of an element (e.g., `</h1>`).\n\n3. **Attributes**: Tags can have attributes that provide additional information about an element. For example:\n   ```html\n   <a href="https://www.example.com">Visit Example</a>\n   ```\n   In this case, `href` is an attribute of the `<a>` (anchor) tag, which specifies the URL the link points to.\n\n4. **Nesting**: You can place elements inside one another. This allows you to create more complex structures. For instance:\n   ```html\n   <div>\n       <h2>Welcome!</h2>\n       <p>This is a simple HTML example.</p>\n   </div>\n   ```\n   Here, the `<h2>` and `<p>` elements are nested within a `<div>` element.\n\n5. **Document Structure**: An HTML document typically starts with a `<!DOCTYPE html>` declaration, followed by the `<html>` tag, which wraps the entire content of the page. Here’s a simple structure:\n   ```html\n   <!DOCTYPE html>\n   <html>\n       <head>\n           <title>My First Web Page</title>\n       </head>\n       <body>\n           <h1>Hello, World!</h1>\n           <p>This is my first web page.</p>\n       </body>\n   </html>\n   ```\n\n### Analogy:\nYou can think of HTML as a recipe for a dish. Just	explanation	detailed	2026-02-14 16:57:52.258937
97	2	user	Explain this concept with an example	\N	\N	2026-02-14 17:04:22.610983
98	2	assistant	I'm excited to help you out! This lab focuses on practicing how to declare variables and print output to the console using JavaScript.\n\nLet's start with step 1 — you need to declare a variable called `greeting` and set it to `"Hello, World!"`. In JavaScript, you can use the `let` or `const` keywords to create a variable. Think of a variable like a labeled box that holds a value. In this case, your box is named `greeting`, and inside, you're placing the text `"Hello, World!"`.\n\nHere's how you might write that:\n\n```javascript\nlet greeting = "Hello, World!";\n```\n\nNext, for step 2, you need to declare another variable called `number` and set it to `42`. You can do it in the same way:\n\n```javascript\nlet number = 42;\n```\n\nNow, for step 3, you will use `console.log()` to print the `greeting` variable. It would look like this:\n\n```javascript\nconsole.log(greeting);\n```\n\nAnd for step 4, you'll do the same for the `number` variable:\n\n```javascript\nconsole.log(number);\n```\n\nWhen you run your code, the expected output will be:\n\n```\nHello, World!\n42\n```\n\nYou're doing great! If you're ready to add these lines to your code, what's the next thing you'd like to explore? "How do I use console.log to print my variable?"	explanation	detailed	2026-02-14 17:04:22.610983
99	3	user	Help me build my portfolio	\N	\N	2026-02-19 19:28:22.597979
100	3	assistant	Absolutely! Building a strong portfolio is essential for showcasing your skills and experiences. Here are some steps to help you create an impressive portfolio:\n\n### 1. Define Your Goals\n   - **What do you want to achieve?** Think about the type of job or projects you want to attract.\n   - **Target Audience:** Who will view your portfolio? Tailor it to their interests.\n\n### 2. Choose a Platform\n   - **Website Builders:** Consider platforms like GitHub Pages, Wix, or WordPress.\n   - **GitHub:** Great for developers to showcase code and projects.\n\n### 3. Showcase Your Best Work\n   - **Projects:** Include 3-5 of your best projects. Make sure they reflect your skills and interests.\n     - Provide clear descriptions.\n     - Include links to live demos or GitHub repositories.\n   - **Case Studies:** If applicable, write about the challenges you faced and how you solved them.\n\n### 4. Include Your Resume\n   - **Professional Summary:** A brief introduction about yourself.\n   - **Skills Section:** Highlight technical skills and tools you are proficient in.\n\n### 5. Add Personal Touches\n   - **About Me Section:** Share your story, interests, and what motivates you.\n   - **Contact Information:** Make it easy for potential employers or collaborators to reach you.\n\n### 6. Keep It Updated\n   - Regularly add new projects or experiences to keep your portfolio fresh.\n\n### 7. Get Feedback\n   - Share your portfolio with peers or mentors for constructive feedback.\n\n### 8. Learn From Others\n   - Look at portfolios from professionals in your field for inspiration.\n\nWould you like to discuss any specific projects you have in mind, or is there a particular area where you need more guidance? \n\nAnd remember, whenever you're ready, I'm here to explore your lessons together!	explanation	detailed	2026-02-19 19:28:22.597979
101	3	user	Which course should I start with?	\N	\N	2026-02-23 17:13:12.615181
102	3	assistant	That’s a great question! Choosing the right course can set a solid foundation for your learning journey. Here are some steps to help you decide:\n\n1. **Identify Your Interests**:\n   - What topics are you passionate about? (e.g., web development, data science, artificial intelligence)\n   \n2. **Consider Your Goals**:\n   - Are you looking to change careers, enhance your current skills, or explore a new hobby?\n\n3. **Assess Your Background**:\n   - Do you have any prior experience in programming or tech? Some courses might require a basic understanding of concepts.\n\n4. **Start with Fundamentals**:\n   - If you’re new to tech, consider starting with introductory courses. Here are a few suggestions:\n     - **Programming Basics**: Learn the fundamentals of programming with Python or JavaScript.\n     - **Web Development**: A beginner-friendly course on HTML, CSS, and JavaScript.\n     - **Data Science**: Introductory courses that cover statistics and basic data analysis.\n\n5. **Explore Project-Based Courses**:\n   - These can be very engaging and help you apply what you learn. Look for courses where you can build projects along the way.\n\n6. **Check Reviews and Ratings**:\n   - Look for courses that have good feedback from other learners.\n\nOnce you have a clearer idea of your interests and goals, I can help you find specific courses that match! What do you think? Shall we explore some options together?	explanation	detailed	2026-02-23 17:13:12.615181
103	3	user	hi	\N	\N	2026-02-24 04:16:17.764315
104	3	assistant	Hello! It's wonderful to see you here. I'm Usha, your learning companion. I'm here to guide, support, and grow with you on your journey. Whether you want to dive into a lesson, chat, or explore something new, I'm excited to be part of it. \n\nWhat would you like to start with today?	explanation	detailed	2026-02-24 04:16:17.764315
\.


--
-- Data for Name: shishya_voucher_redemptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_voucher_redemptions (id, user_id, voucher_code, points_received, redeemed_at) FROM stdin;
\.


--
-- Data for Name: shishya_vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shishya_vouchers (id, code, points, bonus_percent, max_usage, used_count, is_active, expiry_date, created_at) FROM stdin;
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tests (id, course_id, title, description, duration_minutes, passing_percentage, questions, max_attempts, shuffle_questions, show_correct_answers, created_at) FROM stdin;
1	1	Web Development Fundamentals Test	Test your knowledge of HTML, CSS, and JavaScript basics.	30	70	[{"id":"q1","question":"What does HTML stand for?","options":["Hyper Text Markup Language","High Tech Modern Language","Home Tool Markup Language","Hyperlinks and Text Markup Language"],"correctAnswer":0},{"id":"q2","question":"Which CSS property is used to change the text color?","options":["font-color","text-color","color","foreground-color"],"correctAnswer":2},{"id":"q3","question":"Which keyword is used to declare a variable in JavaScript?","options":["var","let","const","All of the above"],"correctAnswer":3},{"id":"q4","question":"What is the correct HTML element for the largest heading?","options":["<heading>","<h6>","<h1>","<head>"],"correctAnswer":2},{"id":"q5","question":"Which property is used to change the background color in CSS?","options":["bgcolor","background-color","color","background"],"correctAnswer":1}]	3	t	f	2026-01-08 14:11:18.027126
2	2	React Fundamentals Test	Assess your understanding of React components, state, and hooks.	45	70	[{"id":"q1","question":"What is the correct way to create a functional component?","options":["function MyComponent() {}","class MyComponent extends React.Component","new Component()","React.createComponent()"],"correctAnswer":0},{"id":"q2","question":"Which hook is used to manage state in functional components?","options":["useEffect","useContext","useState","useReducer"],"correctAnswer":2},{"id":"q3","question":"What is JSX?","options":["JavaScript XML","Java Syntax Extension","JSON XML","JavaScript Extension"],"correctAnswer":0},{"id":"q4","question":"How do you pass data from parent to child component?","options":["Using state","Using props","Using context","Using refs"],"correctAnswer":1},{"id":"q5","question":"What does useEffect hook do?","options":["Manages state","Handles side effects","Creates context","Optimizes performance"],"correctAnswer":1}]	3	t	f	2026-01-08 14:11:18.027126
3	3	TypeScript Advanced Patterns Test	Test your knowledge of TypeScript generics and utility types.	40	75	[{"id":"q1","question":"What is a generic type in TypeScript?","options":["A type that can work with multiple types","A type that only works with objects","A type for generic functions only","A type that cannot be changed"],"correctAnswer":0},{"id":"q2","question":"Which utility type makes all properties optional?","options":["Required","Readonly","Partial","Pick"],"correctAnswer":2},{"id":"q3","question":"What does the Pick utility type do?","options":["Picks random properties","Creates a type with selected properties","Removes properties","Makes properties required"],"correctAnswer":1},{"id":"q4","question":"How do you constrain a generic type?","options":["Using extends keyword","Using implements keyword","Using typeof","Using instanceof"],"correctAnswer":0},{"id":"q5","question":"What is the Omit utility type used for?","options":["Including specific properties","Excluding specific properties","Making properties optional","Making properties required"],"correctAnswer":1}]	2	t	f	2026-01-08 14:11:18.027126
4	4	Python for Data Science Test	Evaluate your Python and data analysis skills.	35	70	[{"id":"q1","question":"Which library is used for numerical computing in Python?","options":["Pandas","NumPy","Matplotlib","Scikit-learn"],"correctAnswer":1},{"id":"q2","question":"What is a DataFrame in Pandas?","options":["A 1D array","A 2D labeled data structure","A Python dictionary","A NumPy array"],"correctAnswer":1},{"id":"q3","question":"How do you import NumPy conventionally?","options":["import numpy","import numpy as np","from numpy import *","import np"],"correctAnswer":1},{"id":"q4","question":"Which method is used to read CSV files in Pandas?","options":["pd.load_csv()","pd.read_csv()","pd.import_csv()","pd.open_csv()"],"correctAnswer":1},{"id":"q5","question":"What does df.head() return?","options":["First row","Last 5 rows","First 5 rows","Column names"],"correctAnswer":2}]	3	t	f	2026-01-08 14:11:18.027126
5	5	Node.js Backend Test	Test your knowledge of Node.js and Express.	40	70	[{"id":"q1","question":"What is Express.js?","options":["A database","A web framework for Node.js","A frontend library","A testing tool"],"correctAnswer":1},{"id":"q2","question":"Which method is used to create a GET route in Express?","options":["app.get()","app.route()","app.fetch()","app.request()"],"correctAnswer":0},{"id":"q3","question":"What is middleware in Express?","options":["Database connection","Functions that execute during request processing","Frontend components","Error handlers only"],"correctAnswer":1},{"id":"q4","question":"How do you send JSON response in Express?","options":["res.send()","res.json()","res.write()","res.end()"],"correctAnswer":1},{"id":"q5","question":"What is the purpose of body-parser?","options":["Parse HTML","Parse request body","Parse URLs","Parse cookies"],"correctAnswer":1}]	3	t	f	2026-01-08 14:11:18.027126
6	6	AWS Cloud Architecture Test	Assess your AWS services knowledge.	50	75	[{"id":"q1","question":"What is Amazon S3 used for?","options":["Computing","Object storage","Database","Networking"],"correctAnswer":1},{"id":"q2","question":"What is AWS Lambda?","options":["Virtual machine","Serverless compute","Database service","Storage service"],"correctAnswer":1},{"id":"q3","question":"What does EC2 stand for?","options":["Elastic Compute Cloud","Electronic Computer Center","Easy Cloud Computing","Enterprise Cloud Container"],"correctAnswer":0},{"id":"q4","question":"Which service is used for managed databases?","options":["S3","Lambda","RDS","EC2"],"correctAnswer":2},{"id":"q5","question":"What is CloudFormation used for?","options":["Storage","Infrastructure as Code","Computing","Networking"],"correctAnswer":1}]	2	t	f	2026-01-08 14:11:18.027126
\.


--
-- Data for Name: udyog_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_applications (id, job_id, student_id, matching_score, status, applied_at, updated_at) FROM stdin;
\.


--
-- Data for Name: udyog_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_assignments (id, user_id, internship_id, status, progress, skill_score, assigned_role, started_at, completed_at, created_at, batch_id) FROM stdin;
2	deb463f3-4431-4b02-b547-f928bdef8f5a	2	completed	50	100	Lead Developer	2026-02-24 04:19:47.348175	2026-02-24 04:33:14.247	2026-02-24 04:19:47.348175	2
1	deb463f3-4431-4b02-b547-f928bdef8f5a	3	completed	50	100	Lead Developer	2026-02-24 03:56:39.118679	2026-02-24 04:41:24.843	2026-02-24 03:56:39.118679	1
\.


--
-- Data for Name: udyog_batch_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_batch_members (id, batch_id, user_id, role, skill_score, performance_score, task_completion_rate, deadline_compliance, quality_score, collaboration_score, joined_at) FROM stdin;
1	1	deb463f3-4431-4b02-b547-f928bdef8f5a	developer	100	0	0	0	0	0	2026-02-24 03:56:39.113405
2	2	deb463f3-4431-4b02-b547-f928bdef8f5a	developer	100	0	0	0	0	0	2026-02-24 04:19:47.344533
\.


--
-- Data for Name: udyog_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_batches (id, internship_id, batch_number, status, start_date, end_date, created_at) FROM stdin;
1	3	1	active	2026-02-24 04:23:51.412151	2026-03-24 04:23:51.412151	2026-02-24 03:56:39.086309
2	2	1	active	2026-02-24 04:23:51.412151	2026-03-24 04:23:51.412151	2026-02-24 04:19:47.332323
\.


--
-- Data for Name: udyog_certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_certificates (id, user_id, internship_id, certificate_id, issue_date, created_at, batch_id, role, performance_score, duration) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	2	UDYOG-1166412A	2026-02-24 04:33:14.211556	2026-02-24 04:33:14.211556	\N	\N	0	\N
2	deb463f3-4431-4b02-b547-f928bdef8f5a	3	UDYOG-6221A796	2026-02-24 04:41:24.809348	2026-02-24 04:41:24.809348	\N	\N	0	\N
\.


--
-- Data for Name: udyog_hr_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_hr_users (id, email, password_hash, name, company_name, company_website, designation, phone, is_approved, is_active, approved_by, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: udyog_internships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_internships (id, title, description, short_description, skill_level, domain, duration, max_participants, is_active, created_by, created_at, updated_at, required_skills, milestones, batch_size) FROM stdin;
1	Full Stack Web Development Intern	Build a production-ready web application from scratch. You will work on both frontend (React, TailwindCSS) and backend (Node.js, Express, PostgreSQL) technologies. This internship simulates a real startup development environment where you will participate in code reviews, sprint planning, and deployments.	Build real web apps with React, Node.js & PostgreSQL in a simulated startup environment.	beginner	Web Development	4 weeks	0	t	\N	2026-02-23 09:59:34.017284	2026-02-23 09:59:34.017284	\N	\N	5
2	Data Analytics Project Associate	Analyze real-world datasets, create visualizations, and build dashboards. Work with Python, Pandas, and SQL to extract insights from data. This internship focuses on practical data analysis skills used in the industry including data cleaning, statistical analysis, and presentation.	Analyze datasets and build dashboards using Python, Pandas & SQL.	intermediate	Data Science	6 weeks	0	t	\N	2026-02-23 09:59:34.017284	2026-02-23 09:59:34.017284	\N	\N	5
3	Cloud Infrastructure Lead Developer	Design and implement scalable cloud architectures using AWS/GCP services. Lead a team simulation involving microservices, CI/CD pipelines, containerization with Docker, and infrastructure as code with Terraform. This advanced internship is for students who want to master DevOps practices.	Design cloud architectures with AWS/GCP, Docker & CI/CD pipelines.	advanced	DevOps	8 weeks	0	t	\N	2026-02-23 09:59:34.017284	2026-02-23 09:59:34.017284	\N	\N	5
4	Mobile App Development Intern	Build cross-platform mobile applications using React Native. Learn mobile UI/UX best practices, state management, API integration, and deployment to app stores. This internship covers the full mobile development lifecycle.	Build cross-platform mobile apps with React Native & deploy to app stores.	beginner	Mobile Development	4 weeks	0	t	\N	2026-02-23 09:59:34.017284	2026-02-23 09:59:34.017284	\N	\N	5
5	UI/UX Design Project Associate	Create user-centered designs for web and mobile applications. Work with Figma, conduct user research, create wireframes, prototypes, and design systems. This internship focuses on the complete design thinking process.	Create user-centered designs with Figma, wireframes & design systems.	intermediate	UI/UX Design	6 weeks	0	t	\N	2026-02-23 09:59:34.017284	2026-02-23 09:59:34.017284	\N	\N	5
6	Movie Recommendation	This advanced internship immerses students in building a scalable, AI-driven movie recommendation system that mimics real-world industry applications. Over 8 weeks, participants will architect and develop complex machine learning pipelines, incorporating collaborative filtering, content-based filtering, and hybrid recommendation techniques. Students will gain hands-on experience with data preprocessing, feature engineering, model selection, and evaluation metrics tailored for recommendation systems. They will also design and implement a microservices architecture to deploy the recommendation engine, ensuring high availability and scalability.\n\nThroughout the program, teams will work closely in defined roles—Team Lead, Developer, QA/Tester—to simulate authentic workplace dynamics. Participants will use technologies such as Python, TensorFlow or PyTorch, Docker, REST APIs, and cloud platforms like AWS or GCP. By the end, students will have developed a fully functional movie recommendation platform complete with a web interface, robust backend services, and comprehensive automated testing pipelines, preparing them for leadership roles in AI product development.	Build and deploy a scalable AI-powered movie recommendation system.	advanced	Machine Learning	8 weeks	0	t	\N	2026-02-23 14:13:08.34475	2026-02-23 14:13:08.34475	\N	\N	5
7	Movie Profit Prediction using 300 Movies Data	This advanced internship program challenges students to build a comprehensive machine learning system that predicts movie profits using a dataset of 300 movies. Participants will engage in end-to-end data science workflows, including data preprocessing, feature engineering, exploratory data analysis, model selection, and deployment. The program emphasizes leadership, architecture design, and collaborative problem-solving within a simulated team environment. Students will gain hands-on experience with Python, pandas, scikit-learn, and cloud-based deployment tools, while also learning best practices in version control, testing, and project management.\n\nThroughout the 8 weeks, interns will work in teams of five with clearly defined roles such as Team Lead, Developer, and QA/Tester. They will design and implement a scalable prediction pipeline, perform rigorous model evaluation, and optimize model performance to generate reliable profit forecasts. By the end of the internship, teams will deliver a fully functional, documented, and tested machine learning application capable of predicting movie profits, along with a presentation detailing their approach, challenges, and results.	Build and deploy an ML model to predict movie profits using real-world data.	advanced	Machine Learning	8 weeks	0	t	\N	2026-02-23 17:02:07.274067	2026-02-23 17:02:07.274067	\N	\N	5
\.


--
-- Data for Name: udyog_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_jobs (id, hr_id, title, description, required_skills, internship_required, min_skill_score, location, salary_range, job_type, status, deadline, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: udyog_skill_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_skill_assessments (id, user_id, domain, score, level, assessed_at) FROM stdin;
1	deb463f3-4431-4b02-b547-f928bdef8f5a	Web Development	0	beginner	2026-02-23 16:22:45.076248
2	deb463f3-4431-4b02-b547-f928bdef8f5a	Data Science	0	beginner	2026-02-24 03:34:33.946293
3	deb463f3-4431-4b02-b547-f928bdef8f5a	Data Science	0	beginner	2026-02-24 03:36:27.580238
4	deb463f3-4431-4b02-b547-f928bdef8f5a	Data Science	100	advanced	2026-02-24 03:56:26.555917
5	deb463f3-4431-4b02-b547-f928bdef8f5a	Data Science	100	advanced	2026-02-24 04:19:38.732196
\.


--
-- Data for Name: udyog_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_submissions (id, assignment_id, task_id, content, file_url, feedback, ai_feedback, status, submitted_at, reviewed_at, batch_id, user_id, score, approved) FROM stdin;
1	1	\N	done	\N	\N	\N	pending	2026-02-24 04:41:39.306925	\N	\N	\N	0	f
\.


--
-- Data for Name: udyog_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udyog_tasks (id, internship_id, title, description, status, order_index, created_at, batch_id, assigned_to, score, max_score, due_date) FROM stdin;
1	1	Setup Development Environment	Install Node.js, VS Code, and create a new React project with Vite. Configure ESLint and Prettier.	todo	1	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
2	1	Build Landing Page	Create a responsive landing page with hero section, features grid, and footer using TailwindCSS.	todo	2	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
3	1	Implement Authentication	Add user signup and login functionality with JWT tokens and session management.	todo	3	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
4	1	Create REST API	Design and implement REST API endpoints for CRUD operations using Express.js and PostgreSQL.	todo	4	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
5	1	Final Deployment	Deploy the application to production, configure environment variables, and run final testing.	todo	5	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
6	2	Data Collection & Cleaning	Gather datasets from public sources, clean missing values, handle outliers, and prepare data for analysis.	todo	1	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
7	2	Exploratory Data Analysis	Perform statistical analysis, create correlation matrices, and identify key patterns in the data.	todo	2	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
8	2	Build Visualization Dashboard	Create interactive charts and graphs using matplotlib/plotly to present findings.	todo	3	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
9	2	Write Analysis Report	Document findings, methodology, and insights in a professional report format.	todo	4	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
10	3	Architecture Design	Design the microservices architecture diagram, define service boundaries, and plan communication patterns.	todo	1	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
11	3	Container Setup	Create Dockerfiles for each service, set up Docker Compose for local development.	todo	2	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
12	3	CI/CD Pipeline	Configure GitHub Actions for automated testing, building, and deployment workflows.	todo	3	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
13	3	Infrastructure as Code	Write Terraform configs for cloud resources, implement auto-scaling, and set up monitoring.	todo	4	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
14	3	Security & Documentation	Implement security best practices, secret management, and write comprehensive documentation.	todo	5	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
15	4	React Native Setup	Set up React Native development environment, configure navigation, and create initial screens.	todo	1	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
16	4	UI Components	Build reusable UI components following mobile design patterns and platform guidelines.	todo	2	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
17	4	API Integration	Connect to backend APIs, implement data fetching, caching, and offline support.	todo	3	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
18	4	Testing & Deployment	Write unit tests, perform device testing, and prepare for app store submission.	todo	4	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
19	5	User Research	Conduct user interviews, create personas, and map user journeys for the target audience.	todo	1	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
20	5	Wireframing	Create low-fidelity wireframes for all key screens and user flows in Figma.	todo	2	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
21	5	Visual Design	Design high-fidelity mockups with a consistent design system including colors, typography, and components.	todo	3	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
22	5	Prototype & Testing	Build interactive prototypes and conduct usability testing with target users.	todo	4	2026-02-23 09:59:54.786235	\N	\N	0	100	\N
23	6	Data Exploration and Preprocessing	Individually analyze the provided movie dataset to understand its structure, distributions, and missing values. Perform data cleaning and feature engineering to prepare the dataset for model training. Deliverables include a comprehensive data report and a clean, preprocessed dataset ready for modeling.	todo	1	2026-02-23 14:13:09.469598	\N	\N	0	100	\N
24	6	Develop Collaborative Filtering Model	Implement a collaborative filtering recommendation model using matrix factorization techniques. Evaluate the model performance using RMSE and precision/recall metrics. Submit a detailed report outlining model design, training process, and evaluation results.	todo	2	2026-02-23 14:13:09.772197	\N	\N	0	100	\N
25	6	Build Content-Based Filtering Model	Create a content-based recommendation model leveraging movie metadata such as genres, cast, and descriptions. Use techniques such as TF-IDF and cosine similarity. Compare results with the collaborative filtering model and document findings.	todo	3	2026-02-23 14:13:10.060585	\N	\N	0	100	\N
26	6	Integrate Hybrid Recommendation System	Collaboratively design and develop a hybrid recommendation system that combines collaborative and content-based methods to improve accuracy and coverage. Implement model blending strategies and perform cross-validation. Deliver a working prototype and performance analysis.	todo	4	2026-02-23 14:13:10.298543	\N	\N	0	100	\N
27	6	API Development for Model Serving	As a team, develop RESTful APIs to serve the recommendation models using Flask or FastAPI. Ensure endpoints handle user requests efficiently and return recommendations in real-time. Deliverables include API documentation and deployed services on a cloud platform.	todo	5	2026-02-23 14:13:10.56606	\N	\N	0	100	\N
28	6	Design Microservices Architecture	The team lead will architect a microservices-based system to modularize the recommendation engine, user management, and logging services. Developers will containerize each microservice using Docker and set up orchestration configurations. Deliver a deployment-ready architecture diagram and container images.	todo	6	2026-02-23 14:13:10.818653	\N	\N	0	100	\N
29	6	Deploy and Scale on Cloud Infrastructure	Deploy the containerized microservices to a cloud platform (AWS/GCP) using Kubernetes or similar orchestration tools. Implement auto-scaling and load balancing to ensure high availability. Provide deployment scripts and a monitoring dashboard.	todo	7	2026-02-23 14:13:11.058075	\N	\N	0	100	\N
30	6	Implement Automated Testing and QA	The QA/Tester role will design and execute comprehensive automated tests covering unit, integration, and end-to-end scenarios for the recommendation system and APIs. Submit test plans, results, and bug reports. Collaborate with developers to fix identified issues.	todo	8	2026-02-23 14:13:11.316978	\N	\N	0	100	\N
31	6	Final Presentation and Code Review	Prepare a detailed presentation showcasing the architecture, models, deployment, and testing outcomes. Conduct a peer code review session to discuss best practices and lessons learned. Deliverables include slides, demo video, and reviewed code repository.	todo	9	2026-02-23 14:13:11.552043	\N	\N	0	100	\N
32	7	Data Exploration and Cleaning	Individually analyze the provided 300-movie dataset to identify missing values, outliers, and inconsistencies. Document data quality issues and apply cleaning techniques such as imputation and normalization. Deliver a cleaned and well-documented dataset along with an exploratory data analysis report highlighting key insights and data distributions.	todo	1	2026-02-23 17:02:08.118096	\N	\N	0	100	\N
33	7	Feature Engineering and Selection	Collaboratively brainstorm and implement new features from raw data that could improve profit prediction. Perform feature scaling, encoding of categorical variables, and selection of relevant features using statistical methods or model-based importance. Deliver a final feature set and a rationale document explaining feature choices.	todo	2	2026-02-23 17:02:08.365448	\N	\N	0	100	\N
34	7	Baseline Model Development	Develop an initial regression model (e.g., Linear Regression) to predict movie profits using the engineered features. Evaluate model performance using appropriate metrics like RMSE and R² on a validation set. Document assumptions, model limitations, and potential improvements.	todo	3	2026-02-23 17:02:08.600242	\N	\N	0	100	\N
35	7	Advanced Model Implementation and Tuning	Implement more complex models such as Random Forests, Gradient Boosting, or Neural Networks. Perform hyperparameter tuning using cross-validation and grid/random search to optimize model accuracy. Compare models and select the best-performing one with justification.	todo	4	2026-02-23 17:02:08.837052	\N	\N	0	100	\N
36	7	Model Testing and QA	QA/Testers design and execute test cases to validate model robustness and stability, including edge cases and data distribution shifts. Ensure reproducibility of results and integration tests for the data pipeline. Deliver a comprehensive testing report and bug fixes.	todo	5	2026-02-23 17:02:09.071641	\N	\N	0	100	\N
37	7	Deployment Pipeline Setup	Set up an automated deployment pipeline for the trained model using cloud services or containerization tools like Docker. Automate data ingestion, model inference, and result output. Deliver a deployable application and deployment documentation.	todo	6	2026-02-23 17:02:09.326951	\N	\N	0	100	\N
38	7	Project Architecture and Documentation	The Team Lead designs the overall project architecture, including data flow, module interactions, and team workflows. Prepare detailed documentation covering design decisions, code structure, and usage instructions for future developers.	todo	7	2026-02-23 17:02:09.571555	\N	\N	0	100	\N
39	7	Final Presentation and Demo	Prepare and deliver a final team presentation highlighting the project goals, methodology, challenges faced, results, and business impact of the profit prediction model. Conduct a live demo of the deployed application and answer questions.	todo	8	2026-02-23 17:02:09.8153	\N	\N	0	100	\N
41	2	Exploratory Data Analysis	Perform statistical analysis, create correlation matrices, and identify key patterns in the data.	completed	2	2026-02-24 04:23:35.95825	2	\N	0	100	\N
42	2	Build Visualization Dashboard	Create interactive charts and graphs using matplotlib/plotly to present findings.	completed	3	2026-02-24 04:23:35.95825	2	\N	0	100	\N
43	2	Write Analysis Report	Document findings, methodology, and insights in a professional report format.	completed	4	2026-02-24 04:23:35.95825	2	\N	0	100	\N
40	2	Data Collection & Cleaning	Gather datasets from public sources, clean missing values, handle outliers, and prepare data for analysis.	completed	1	2026-02-24 04:23:35.95825	2	\N	0	100	\N
44	3	Architecture Design	Design the microservices architecture diagram, define service boundaries, and plan communication patterns.	completed	1	2026-02-24 04:23:43.485718	1	\N	0	100	\N
46	3	CI/CD Pipeline	Configure GitHub Actions for automated testing, building, and deployment workflows.	completed	3	2026-02-24 04:23:43.485718	1	\N	0	100	\N
45	3	Container Setup	Create Dockerfiles for each service, set up Docker Compose for local development.	completed	2	2026-02-24 04:23:43.485718	1	\N	0	100	\N
48	3	Security & Documentation	Implement security best practices, secret management, and write comprehensive documentation.	completed	5	2026-02-24 04:23:43.485718	1	\N	0	100	\N
47	3	Infrastructure as Code	Write Terraform configs for cloud resources, implement auto-scaling, and set up monitoring.	completed	4	2026-02-24 04:23:43.485718	1	\N	0	100	\N
\.


--
-- Data for Name: zoho_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zoho_tokens (id, access_token, refresh_token, expires_at, scope, api_domain, created_at, updated_at) FROM stdin;
6	1000.2b15248bf729b28c627b53b1a12501b1.0bb7b75821e82692e706b0165b194768	1000.9b482dea37631f2610621208f3900141.569d000f9f7edc79e2ca103397254ba6	2026-02-25 12:26:44.344	TrainerCentral.courseapi.ALL TrainerCentral.userapi.ALL TrainerCentral.sectionapi.ALL TrainerCentral.sessionapi.ALL TrainerCentral.presenterapi.ALL	https://www.zohoapis.in	2026-02-19 10:39:02.991813	2026-02-25 11:26:44.344
\.


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 11, true);


--
-- Name: guru_admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guru_admin_users_id_seq', 2, true);


--
-- Name: labs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.labs_id_seq', 20, true);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 435, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_id_seq', 115, true);


--
-- Name: pricing_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_plans_id_seq', 4, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 9, true);


--
-- Name: shishya_ai_nudge_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_ai_nudge_logs_id_seq', 1, false);


--
-- Name: shishya_course_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_course_enrollments_id_seq', 5, true);


--
-- Name: shishya_credit_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_credit_transactions_id_seq', 8, true);


--
-- Name: shishya_gift_boxes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_gift_boxes_id_seq', 1, false);


--
-- Name: shishya_marksheet_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_marksheet_verifications_id_seq', 1, false);


--
-- Name: shishya_marksheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_marksheets_id_seq', 1, false);


--
-- Name: shishya_motivation_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_motivation_cards_id_seq', 1, false);


--
-- Name: shishya_motivation_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_motivation_rules_id_seq', 10, true);


--
-- Name: shishya_mystery_boxes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_mystery_boxes_id_seq', 1, false);


--
-- Name: shishya_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_notifications_id_seq', 1, false);


--
-- Name: shishya_otp_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_otp_codes_id_seq', 1, false);


--
-- Name: shishya_otp_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_otp_logs_id_seq', 7, true);


--
-- Name: shishya_rule_trigger_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_rule_trigger_logs_id_seq', 1, false);


--
-- Name: shishya_scholarships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_scholarships_id_seq', 1, false);


--
-- Name: shishya_student_streaks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_student_streaks_id_seq', 1, false);


--
-- Name: shishya_user_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_certificates_id_seq', 1, false);


--
-- Name: shishya_user_credits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_credits_id_seq', 4, true);


--
-- Name: shishya_user_lab_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_lab_progress_id_seq', 1, false);


--
-- Name: shishya_user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_progress_id_seq', 1, false);


--
-- Name: shishya_user_project_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_project_submissions_id_seq', 1, false);


--
-- Name: shishya_user_scholarships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_scholarships_id_seq', 1, false);


--
-- Name: shishya_user_test_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_user_test_attempts_id_seq', 1, false);


--
-- Name: shishya_usha_conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_usha_conversations_id_seq', 3, true);


--
-- Name: shishya_usha_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_usha_messages_id_seq', 104, true);


--
-- Name: shishya_voucher_redemptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_voucher_redemptions_id_seq', 1, false);


--
-- Name: shishya_vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shishya_vouchers_id_seq', 1, false);


--
-- Name: tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tests_id_seq', 6, true);


--
-- Name: udyog_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_applications_id_seq', 1, false);


--
-- Name: udyog_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_assignments_id_seq', 2, true);


--
-- Name: udyog_batch_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_batch_members_id_seq', 2, true);


--
-- Name: udyog_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_batches_id_seq', 2, true);


--
-- Name: udyog_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_certificates_id_seq', 2, true);


--
-- Name: udyog_hr_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_hr_users_id_seq', 1, false);


--
-- Name: udyog_internships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_internships_id_seq', 7, true);


--
-- Name: udyog_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_jobs_id_seq', 1, false);


--
-- Name: udyog_skill_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_skill_assessments_id_seq', 5, true);


--
-- Name: udyog_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_submissions_id_seq', 1, true);


--
-- Name: udyog_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udyog_tasks_id_seq', 48, true);


--
-- Name: zoho_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.zoho_tokens_id_seq', 6, true);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: guru_admin_sessions guru_admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru_admin_sessions
    ADD CONSTRAINT guru_admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: guru_admin_users guru_admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru_admin_users
    ADD CONSTRAINT guru_admin_users_email_unique UNIQUE (email);


--
-- Name: guru_admin_users guru_admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru_admin_users
    ADD CONSTRAINT guru_admin_users_pkey PRIMARY KEY (id);


--
-- Name: labs labs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: shishya_ai_nudge_logs shishya_ai_nudge_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_ai_nudge_logs
    ADD CONSTRAINT shishya_ai_nudge_logs_pkey PRIMARY KEY (id);


--
-- Name: shishya_course_enrollments shishya_course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_course_enrollments
    ADD CONSTRAINT shishya_course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: shishya_credit_transactions shishya_credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_credit_transactions
    ADD CONSTRAINT shishya_credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: shishya_gift_boxes shishya_gift_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_gift_boxes
    ADD CONSTRAINT shishya_gift_boxes_pkey PRIMARY KEY (id);


--
-- Name: shishya_marksheet_verifications shishya_marksheet_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheet_verifications
    ADD CONSTRAINT shishya_marksheet_verifications_pkey PRIMARY KEY (id);


--
-- Name: shishya_marksheets shishya_marksheets_marksheet_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheets
    ADD CONSTRAINT shishya_marksheets_marksheet_id_unique UNIQUE (marksheet_id);


--
-- Name: shishya_marksheets shishya_marksheets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheets
    ADD CONSTRAINT shishya_marksheets_pkey PRIMARY KEY (id);


--
-- Name: shishya_marksheets shishya_marksheets_verification_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheets
    ADD CONSTRAINT shishya_marksheets_verification_code_unique UNIQUE (verification_code);


--
-- Name: shishya_motivation_cards shishya_motivation_cards_card_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_cards
    ADD CONSTRAINT shishya_motivation_cards_card_id_unique UNIQUE (card_id);


--
-- Name: shishya_motivation_cards shishya_motivation_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_cards
    ADD CONSTRAINT shishya_motivation_cards_pkey PRIMARY KEY (id);


--
-- Name: shishya_motivation_rules shishya_motivation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_rules
    ADD CONSTRAINT shishya_motivation_rules_pkey PRIMARY KEY (id);


--
-- Name: shishya_mystery_boxes shishya_mystery_boxes_box_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_mystery_boxes
    ADD CONSTRAINT shishya_mystery_boxes_box_id_unique UNIQUE (box_id);


--
-- Name: shishya_mystery_boxes shishya_mystery_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_mystery_boxes
    ADD CONSTRAINT shishya_mystery_boxes_pkey PRIMARY KEY (id);


--
-- Name: shishya_notifications shishya_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_notifications
    ADD CONSTRAINT shishya_notifications_pkey PRIMARY KEY (id);


--
-- Name: shishya_otp_codes shishya_otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_codes
    ADD CONSTRAINT shishya_otp_codes_pkey PRIMARY KEY (id);


--
-- Name: shishya_otp_logs shishya_otp_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_logs
    ADD CONSTRAINT shishya_otp_logs_pkey PRIMARY KEY (id);


--
-- Name: shishya_rule_trigger_logs shishya_rule_trigger_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_rule_trigger_logs
    ADD CONSTRAINT shishya_rule_trigger_logs_pkey PRIMARY KEY (id);


--
-- Name: shishya_scholarships shishya_scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_scholarships
    ADD CONSTRAINT shishya_scholarships_pkey PRIMARY KEY (id);


--
-- Name: shishya_scholarships shishya_scholarships_scholarship_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_scholarships
    ADD CONSTRAINT shishya_scholarships_scholarship_id_unique UNIQUE (scholarship_id);


--
-- Name: shishya_sessions shishya_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_sessions
    ADD CONSTRAINT shishya_sessions_pkey PRIMARY KEY (id);


--
-- Name: shishya_student_streaks shishya_student_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_student_streaks
    ADD CONSTRAINT shishya_student_streaks_pkey PRIMARY KEY (id);


--
-- Name: shishya_student_streaks shishya_student_streaks_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_student_streaks
    ADD CONSTRAINT shishya_student_streaks_user_id_unique UNIQUE (user_id);


--
-- Name: shishya_user_certificates shishya_user_certificates_certificate_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_certificates
    ADD CONSTRAINT shishya_user_certificates_certificate_id_unique UNIQUE (certificate_id);


--
-- Name: shishya_user_certificates shishya_user_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_certificates
    ADD CONSTRAINT shishya_user_certificates_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_credits shishya_user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_credits
    ADD CONSTRAINT shishya_user_credits_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_credits shishya_user_credits_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_credits
    ADD CONSTRAINT shishya_user_credits_user_id_unique UNIQUE (user_id);


--
-- Name: shishya_user_lab_progress shishya_user_lab_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_lab_progress
    ADD CONSTRAINT shishya_user_lab_progress_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_profiles shishya_user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_profiles
    ADD CONSTRAINT shishya_user_profiles_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_profiles shishya_user_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_profiles
    ADD CONSTRAINT shishya_user_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: shishya_user_profiles shishya_user_profiles_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_profiles
    ADD CONSTRAINT shishya_user_profiles_username_unique UNIQUE (username);


--
-- Name: shishya_user_progress shishya_user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_progress
    ADD CONSTRAINT shishya_user_progress_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_project_submissions shishya_user_project_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_project_submissions
    ADD CONSTRAINT shishya_user_project_submissions_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_scholarships shishya_user_scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_scholarships
    ADD CONSTRAINT shishya_user_scholarships_pkey PRIMARY KEY (id);


--
-- Name: shishya_user_test_attempts shishya_user_test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_test_attempts
    ADD CONSTRAINT shishya_user_test_attempts_pkey PRIMARY KEY (id);


--
-- Name: shishya_users shishya_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_users
    ADD CONSTRAINT shishya_users_email_unique UNIQUE (email);


--
-- Name: shishya_users shishya_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_users
    ADD CONSTRAINT shishya_users_pkey PRIMARY KEY (id);


--
-- Name: shishya_usha_conversations shishya_usha_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_conversations
    ADD CONSTRAINT shishya_usha_conversations_pkey PRIMARY KEY (id);


--
-- Name: shishya_usha_messages shishya_usha_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_messages
    ADD CONSTRAINT shishya_usha_messages_pkey PRIMARY KEY (id);


--
-- Name: shishya_voucher_redemptions shishya_voucher_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_voucher_redemptions
    ADD CONSTRAINT shishya_voucher_redemptions_pkey PRIMARY KEY (id);


--
-- Name: shishya_vouchers shishya_vouchers_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_vouchers
    ADD CONSTRAINT shishya_vouchers_code_unique UNIQUE (code);


--
-- Name: shishya_vouchers shishya_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_vouchers
    ADD CONSTRAINT shishya_vouchers_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: udyog_applications udyog_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_applications
    ADD CONSTRAINT udyog_applications_pkey PRIMARY KEY (id);


--
-- Name: udyog_assignments udyog_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_assignments
    ADD CONSTRAINT udyog_assignments_pkey PRIMARY KEY (id);


--
-- Name: udyog_batch_members udyog_batch_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batch_members
    ADD CONSTRAINT udyog_batch_members_pkey PRIMARY KEY (id);


--
-- Name: udyog_batches udyog_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batches
    ADD CONSTRAINT udyog_batches_pkey PRIMARY KEY (id);


--
-- Name: udyog_certificates udyog_certificates_certificate_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates
    ADD CONSTRAINT udyog_certificates_certificate_id_unique UNIQUE (certificate_id);


--
-- Name: udyog_certificates udyog_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates
    ADD CONSTRAINT udyog_certificates_pkey PRIMARY KEY (id);


--
-- Name: udyog_hr_users udyog_hr_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_hr_users
    ADD CONSTRAINT udyog_hr_users_email_unique UNIQUE (email);


--
-- Name: udyog_hr_users udyog_hr_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_hr_users
    ADD CONSTRAINT udyog_hr_users_pkey PRIMARY KEY (id);


--
-- Name: udyog_internships udyog_internships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_internships
    ADD CONSTRAINT udyog_internships_pkey PRIMARY KEY (id);


--
-- Name: udyog_jobs udyog_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_jobs
    ADD CONSTRAINT udyog_jobs_pkey PRIMARY KEY (id);


--
-- Name: udyog_skill_assessments udyog_skill_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_skill_assessments
    ADD CONSTRAINT udyog_skill_assessments_pkey PRIMARY KEY (id);


--
-- Name: udyog_submissions udyog_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions
    ADD CONSTRAINT udyog_submissions_pkey PRIMARY KEY (id);


--
-- Name: udyog_tasks udyog_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_tasks
    ADD CONSTRAINT udyog_tasks_pkey PRIMARY KEY (id);


--
-- Name: zoho_tokens zoho_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zoho_tokens
    ADD CONSTRAINT zoho_tokens_pkey PRIMARY KEY (id);


--
-- Name: guru_admin_sessions guru_admin_sessions_admin_id_guru_admin_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru_admin_sessions
    ADD CONSTRAINT guru_admin_sessions_admin_id_guru_admin_users_id_fk FOREIGN KEY (admin_id) REFERENCES public.guru_admin_users(id);


--
-- Name: labs labs_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: labs labs_lesson_id_lessons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_lesson_id_lessons_id_fk FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: lessons lessons_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: lessons lessons_module_id_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: modules modules_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: projects projects_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: shishya_ai_nudge_logs shishya_ai_nudge_logs_rule_id_shishya_motivation_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_ai_nudge_logs
    ADD CONSTRAINT shishya_ai_nudge_logs_rule_id_shishya_motivation_rules_id_fk FOREIGN KEY (rule_id) REFERENCES public.shishya_motivation_rules(id);


--
-- Name: shishya_ai_nudge_logs shishya_ai_nudge_logs_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_ai_nudge_logs
    ADD CONSTRAINT shishya_ai_nudge_logs_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_course_enrollments shishya_course_enrollments_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_course_enrollments
    ADD CONSTRAINT shishya_course_enrollments_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_credit_transactions shishya_credit_transactions_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_credit_transactions
    ADD CONSTRAINT shishya_credit_transactions_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_gift_boxes shishya_gift_boxes_claimed_by_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_gift_boxes
    ADD CONSTRAINT shishya_gift_boxes_claimed_by_shishya_users_id_fk FOREIGN KEY (claimed_by) REFERENCES public.shishya_users(id);


--
-- Name: shishya_gift_boxes shishya_gift_boxes_sender_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_gift_boxes
    ADD CONSTRAINT shishya_gift_boxes_sender_id_shishya_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_marksheet_verifications shishya_marksheet_verifications_marksheet_id_shishya_marksheets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheet_verifications
    ADD CONSTRAINT shishya_marksheet_verifications_marksheet_id_shishya_marksheets FOREIGN KEY (marksheet_id) REFERENCES public.shishya_marksheets(id);


--
-- Name: shishya_marksheets shishya_marksheets_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_marksheets
    ADD CONSTRAINT shishya_marksheets_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_motivation_cards shishya_motivation_cards_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_motivation_cards
    ADD CONSTRAINT shishya_motivation_cards_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_mystery_boxes shishya_mystery_boxes_rule_id_shishya_motivation_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_mystery_boxes
    ADD CONSTRAINT shishya_mystery_boxes_rule_id_shishya_motivation_rules_id_fk FOREIGN KEY (rule_id) REFERENCES public.shishya_motivation_rules(id);


--
-- Name: shishya_mystery_boxes shishya_mystery_boxes_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_mystery_boxes
    ADD CONSTRAINT shishya_mystery_boxes_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_notifications shishya_notifications_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_notifications
    ADD CONSTRAINT shishya_notifications_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_otp_codes shishya_otp_codes_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_codes
    ADD CONSTRAINT shishya_otp_codes_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_otp_logs shishya_otp_logs_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_otp_logs
    ADD CONSTRAINT shishya_otp_logs_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_rule_trigger_logs shishya_rule_trigger_logs_rule_id_shishya_motivation_rules_id_f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_rule_trigger_logs
    ADD CONSTRAINT shishya_rule_trigger_logs_rule_id_shishya_motivation_rules_id_f FOREIGN KEY (rule_id) REFERENCES public.shishya_motivation_rules(id);


--
-- Name: shishya_rule_trigger_logs shishya_rule_trigger_logs_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_rule_trigger_logs
    ADD CONSTRAINT shishya_rule_trigger_logs_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_scholarships shishya_scholarships_rule_id_shishya_motivation_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_scholarships
    ADD CONSTRAINT shishya_scholarships_rule_id_shishya_motivation_rules_id_fk FOREIGN KEY (rule_id) REFERENCES public.shishya_motivation_rules(id);


--
-- Name: shishya_sessions shishya_sessions_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_sessions
    ADD CONSTRAINT shishya_sessions_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_student_streaks shishya_student_streaks_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_student_streaks
    ADD CONSTRAINT shishya_student_streaks_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_certificates shishya_user_certificates_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_certificates
    ADD CONSTRAINT shishya_user_certificates_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_credits shishya_user_credits_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_credits
    ADD CONSTRAINT shishya_user_credits_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_lab_progress shishya_user_lab_progress_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_lab_progress
    ADD CONSTRAINT shishya_user_lab_progress_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_profiles shishya_user_profiles_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_profiles
    ADD CONSTRAINT shishya_user_profiles_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_progress shishya_user_progress_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_progress
    ADD CONSTRAINT shishya_user_progress_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_project_submissions shishya_user_project_submissions_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_project_submissions
    ADD CONSTRAINT shishya_user_project_submissions_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_scholarships shishya_user_scholarships_scholarship_id_shishya_scholarships_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_scholarships
    ADD CONSTRAINT shishya_user_scholarships_scholarship_id_shishya_scholarships_i FOREIGN KEY (scholarship_id) REFERENCES public.shishya_scholarships(id);


--
-- Name: shishya_user_scholarships shishya_user_scholarships_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_scholarships
    ADD CONSTRAINT shishya_user_scholarships_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_user_test_attempts shishya_user_test_attempts_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_user_test_attempts
    ADD CONSTRAINT shishya_user_test_attempts_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_usha_conversations shishya_usha_conversations_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_conversations
    ADD CONSTRAINT shishya_usha_conversations_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: shishya_usha_messages shishya_usha_messages_conversation_id_shishya_usha_conversation; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_usha_messages
    ADD CONSTRAINT shishya_usha_messages_conversation_id_shishya_usha_conversation FOREIGN KEY (conversation_id) REFERENCES public.shishya_usha_conversations(id);


--
-- Name: shishya_voucher_redemptions shishya_voucher_redemptions_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shishya_voucher_redemptions
    ADD CONSTRAINT shishya_voucher_redemptions_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: tests tests_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: udyog_applications udyog_applications_job_id_udyog_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_applications
    ADD CONSTRAINT udyog_applications_job_id_udyog_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.udyog_jobs(id);


--
-- Name: udyog_applications udyog_applications_student_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_applications
    ADD CONSTRAINT udyog_applications_student_id_shishya_users_id_fk FOREIGN KEY (student_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_assignments udyog_assignments_batch_id_udyog_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_assignments
    ADD CONSTRAINT udyog_assignments_batch_id_udyog_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.udyog_batches(id);


--
-- Name: udyog_assignments udyog_assignments_internship_id_udyog_internships_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_assignments
    ADD CONSTRAINT udyog_assignments_internship_id_udyog_internships_id_fk FOREIGN KEY (internship_id) REFERENCES public.udyog_internships(id);


--
-- Name: udyog_assignments udyog_assignments_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_assignments
    ADD CONSTRAINT udyog_assignments_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_batch_members udyog_batch_members_batch_id_udyog_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batch_members
    ADD CONSTRAINT udyog_batch_members_batch_id_udyog_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.udyog_batches(id);


--
-- Name: udyog_batch_members udyog_batch_members_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batch_members
    ADD CONSTRAINT udyog_batch_members_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_batches udyog_batches_internship_id_udyog_internships_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_batches
    ADD CONSTRAINT udyog_batches_internship_id_udyog_internships_id_fk FOREIGN KEY (internship_id) REFERENCES public.udyog_internships(id);


--
-- Name: udyog_certificates udyog_certificates_batch_id_udyog_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates
    ADD CONSTRAINT udyog_certificates_batch_id_udyog_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.udyog_batches(id);


--
-- Name: udyog_certificates udyog_certificates_internship_id_udyog_internships_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates
    ADD CONSTRAINT udyog_certificates_internship_id_udyog_internships_id_fk FOREIGN KEY (internship_id) REFERENCES public.udyog_internships(id);


--
-- Name: udyog_certificates udyog_certificates_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_certificates
    ADD CONSTRAINT udyog_certificates_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_jobs udyog_jobs_hr_id_udyog_hr_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_jobs
    ADD CONSTRAINT udyog_jobs_hr_id_udyog_hr_users_id_fk FOREIGN KEY (hr_id) REFERENCES public.udyog_hr_users(id);


--
-- Name: udyog_skill_assessments udyog_skill_assessments_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_skill_assessments
    ADD CONSTRAINT udyog_skill_assessments_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_submissions udyog_submissions_assignment_id_udyog_assignments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions
    ADD CONSTRAINT udyog_submissions_assignment_id_udyog_assignments_id_fk FOREIGN KEY (assignment_id) REFERENCES public.udyog_assignments(id);


--
-- Name: udyog_submissions udyog_submissions_batch_id_udyog_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions
    ADD CONSTRAINT udyog_submissions_batch_id_udyog_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.udyog_batches(id);


--
-- Name: udyog_submissions udyog_submissions_task_id_udyog_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions
    ADD CONSTRAINT udyog_submissions_task_id_udyog_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.udyog_tasks(id);


--
-- Name: udyog_submissions udyog_submissions_user_id_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_submissions
    ADD CONSTRAINT udyog_submissions_user_id_shishya_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shishya_users(id);


--
-- Name: udyog_tasks udyog_tasks_assigned_to_shishya_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_tasks
    ADD CONSTRAINT udyog_tasks_assigned_to_shishya_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.shishya_users(id);


--
-- Name: udyog_tasks udyog_tasks_batch_id_udyog_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_tasks
    ADD CONSTRAINT udyog_tasks_batch_id_udyog_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.udyog_batches(id);


--
-- Name: udyog_tasks udyog_tasks_internship_id_udyog_internships_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udyog_tasks
    ADD CONSTRAINT udyog_tasks_internship_id_udyog_internships_id_fk FOREIGN KEY (internship_id) REFERENCES public.udyog_internships(id);


--
-- PostgreSQL database dump complete
--

\unrestrict DwZCAMbWYkFcRrOCOl0BhylTPp3VdQ24Hw4shYU3JfF6iNeZVnhFdvW1tWBjULB

