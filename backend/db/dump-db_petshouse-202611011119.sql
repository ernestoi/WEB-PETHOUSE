--
-- PostgreSQL database dump
--

\restrict ROqdHFpWOtCFKjBFlopcTHccO7iNz2nobUXjNaK40Xfil4xoyQ7dfs5IRnCuCOR

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-01 11:19:26 -05

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
-- TOC entry 2 (class 3079 OID 19761)
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- TOC entry 1117 (class 1247 OID 20503)
-- Name: dom_email; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_email AS character varying(250)
	CONSTRAINT dom_email_check CHECK (((VALUE)::text ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text));


ALTER DOMAIN public.dom_email OWNER TO joux;

--
-- TOC entry 1097 (class 1247 OID 20488)
-- Name: dom_especie; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_especie AS character varying(20)
	CONSTRAINT dom_especie_check CHECK (((VALUE)::text = ANY ((ARRAY['perro'::character varying, 'gato'::character varying])::text[])));


ALTER DOMAIN public.dom_especie OWNER TO joux;

--
-- TOC entry 1109 (class 1247 OID 20497)
-- Name: dom_estado_cita; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_estado_cita AS character varying(20)
	CONSTRAINT dom_estado_cita_check CHECK (((VALUE)::text = ANY ((ARRAY['pendiente'::character varying, 'confirmada'::character varying, 'en_proceso'::character varying, 'completada'::character varying, 'cancelada'::character varying, 'no_asistio'::character varying])::text[])));


ALTER DOMAIN public.dom_estado_cita OWNER TO joux;

--
-- TOC entry 1113 (class 1247 OID 20500)
-- Name: dom_precio; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_precio AS numeric(10,2)
	CONSTRAINT dom_precio_check CHECK ((VALUE >= (0)::numeric));


ALTER DOMAIN public.dom_precio OWNER TO joux;

--
-- TOC entry 1101 (class 1247 OID 20491)
-- Name: dom_tamano; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_tamano AS character varying(20)
	CONSTRAINT dom_tamano_check CHECK (((VALUE)::text = ANY ((ARRAY['pequeno'::character varying, 'mediano'::character varying, 'grande'::character varying, 'gigante'::character varying])::text[])));


ALTER DOMAIN public.dom_tamano OWNER TO joux;

--
-- TOC entry 1105 (class 1247 OID 20494)
-- Name: dom_tipo_pelo; Type: DOMAIN; Schema: public; Owner: joux
--

CREATE DOMAIN public.dom_tipo_pelo AS character varying(20)
	CONSTRAINT dom_tipo_pelo_check CHECK (((VALUE)::text = ANY ((ARRAY['corto'::character varying, 'medio'::character varying, 'largo'::character varying])::text[])));


ALTER DOMAIN public.dom_tipo_pelo OWNER TO joux;

--
-- TOC entry 272 (class 1255 OID 20505)
-- Name: fn_set_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: joux
--

CREATE FUNCTION public.fn_set_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_set_fecha_actualizacion() OWNER TO joux;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 20507)
-- Name: admin; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.admin (
    id_admin integer NOT NULL,
    usuario character varying(100) NOT NULL,
    nombre character varying(250) NOT NULL,
    email public.dom_email NOT NULL,
    contrasena character varying(255) NOT NULL,
    rol character varying(20) DEFAULT 'profesional'::character varying NOT NULL,
    foto_perfil character varying(255),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_admin_rol CHECK (((rol)::text = ANY ((ARRAY['administrador'::character varying, 'profesional'::character varying])::text[])))
);


ALTER TABLE public.admin OWNER TO joux;

--
-- TOC entry 220 (class 1259 OID 20506)
-- Name: admin_id_admin_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.admin ALTER COLUMN id_admin ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.admin_id_admin_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 20702)
-- Name: calificacion; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.calificacion (
    id_calificacion integer NOT NULL,
    id_cita integer NOT NULL,
    puntuacion smallint NOT NULL,
    observacion character varying(250),
    fecha_calificacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_calificacion_puntuacion CHECK (((puntuacion >= 1) AND (puntuacion <= 5)))
);


ALTER TABLE public.calificacion OWNER TO joux;

--
-- TOC entry 235 (class 1259 OID 20701)
-- Name: calificacion_id_calificacion_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.calificacion ALTER COLUMN id_calificacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.calificacion_id_calificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 20642)
-- Name: cita; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.cita (
    id_cita integer NOT NULL,
    id_mascota integer NOT NULL,
    id_variante_servicio integer NOT NULL,
    id_profesional integer,
    fecha_hora_inicio timestamp with time zone NOT NULL,
    fecha_hora_fin timestamp with time zone NOT NULL,
    precio_servicio public.dom_precio NOT NULL,
    estado public.dom_estado_cita DEFAULT 'pendiente'::character varying NOT NULL,
    observacion_cliente character varying(500),
    observacion_profesional character varying(500),
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_cita_horario CHECK ((fecha_hora_fin > fecha_hora_inicio))
);


ALTER TABLE public.cita OWNER TO joux;

--
-- TOC entry 234 (class 1259 OID 20681)
-- Name: cita_adicional; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.cita_adicional (
    id_cita integer NOT NULL,
    id_servicio_adicional integer NOT NULL,
    precio_cobrado public.dom_precio NOT NULL
);


ALTER TABLE public.cita_adicional OWNER TO joux;

--
-- TOC entry 238 (class 1259 OID 20721)
-- Name: cita_historial_estado; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.cita_historial_estado (
    id_historial bigint NOT NULL,
    id_cita integer NOT NULL,
    estado_anterior public.dom_estado_cita,
    estado_nuevo public.dom_estado_cita NOT NULL,
    origen character varying(20) NOT NULL,
    id_admin integer,
    observacion character varying(250),
    fecha_cambio timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_historial_admin CHECK ((((origen)::text = 'admin'::text) = (id_admin IS NOT NULL))),
    CONSTRAINT chk_historial_origen CHECK (((origen)::text = ANY ((ARRAY['cliente'::character varying, 'admin'::character varying, 'sistema'::character varying])::text[])))
);


ALTER TABLE public.cita_historial_estado OWNER TO joux;

--
-- TOC entry 237 (class 1259 OID 20720)
-- Name: cita_historial_estado_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.cita_historial_estado ALTER COLUMN id_historial ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cita_historial_estado_id_historial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 20641)
-- Name: cita_id_cita_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.cita ALTER COLUMN id_cita ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cita_id_cita_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 20529)
-- Name: cliente; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    nombre character varying(250) NOT NULL,
    email public.dom_email NOT NULL,
    contrasena character varying(255) NOT NULL,
    celular character varying(10),
    direccion character varying(250),
    latitud numeric(9,6),
    longitud numeric(9,6),
    foto_perfil character varying(255),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_cliente_celular CHECK (((celular IS NULL) OR ((celular)::text ~ '^09[0-9]{8}$'::text))),
    CONSTRAINT chk_cliente_coordenadas CHECK (((latitud IS NULL) = (longitud IS NULL))),
    CONSTRAINT chk_cliente_latitud CHECK (((latitud IS NULL) OR ((latitud >= ('-90'::integer)::numeric) AND (latitud <= (90)::numeric)))),
    CONSTRAINT chk_cliente_longitud CHECK (((longitud IS NULL) OR ((longitud >= ('-180'::integer)::numeric) AND (longitud <= (180)::numeric))))
);


ALTER TABLE public.cliente OWNER TO joux;

--
-- TOC entry 222 (class 1259 OID 20528)
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.cliente ALTER COLUMN id_cliente ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cliente_id_cliente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 20554)
-- Name: mascota; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.mascota (
    id_mascota integer NOT NULL,
    id_cliente integer NOT NULL,
    nombre character varying(50) NOT NULL,
    especie public.dom_especie NOT NULL,
    raza character varying(50),
    fecha_nacimiento date,
    tamano public.dom_tamano,
    tipo_pelo public.dom_tipo_pelo,
    foto_perfil character varying(255),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_mascota_fecha_nacimiento CHECK (((fecha_nacimiento IS NULL) OR (fecha_nacimiento >= '1990-01-01'::date)))
);


ALTER TABLE public.mascota OWNER TO joux;

--
-- TOC entry 224 (class 1259 OID 20553)
-- Name: mascota_id_mascota_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.mascota ALTER COLUMN id_mascota ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mascota_id_mascota_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 20622)
-- Name: servicio_adicional; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.servicio_adicional (
    id_servicio_adicional integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(500),
    precio public.dom_precio NOT NULL,
    duracion_minutos smallint DEFAULT 15 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_adicional_duracion CHECK (((duracion_minutos >= 0) AND (duracion_minutos <= 600)))
);


ALTER TABLE public.servicio_adicional OWNER TO joux;

--
-- TOC entry 230 (class 1259 OID 20621)
-- Name: servicio_adicional_id_servicio_adicional_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.servicio_adicional ALTER COLUMN id_servicio_adicional ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.servicio_adicional_id_servicio_adicional_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 20578)
-- Name: servicio_principal; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.servicio_principal (
    id_servicio_principal integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(500),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.servicio_principal OWNER TO joux;

--
-- TOC entry 226 (class 1259 OID 20577)
-- Name: servicio_principal_id_servicio_principal_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.servicio_principal ALTER COLUMN id_servicio_principal ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.servicio_principal_id_servicio_principal_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 20768)
-- Name: v_cita_resumen; Type: VIEW; Schema: public; Owner: joux
--

CREATE VIEW public.v_cita_resumen AS
SELECT
    NULL::integer AS id_cita,
    NULL::timestamp with time zone AS fecha_hora_inicio,
    NULL::timestamp with time zone AS fecha_hora_fin,
    NULL::public.dom_estado_cita AS estado,
    NULL::integer AS id_cliente,
    NULL::character varying(250) AS cliente,
    NULL::integer AS id_mascota,
    NULL::character varying(50) AS mascota,
    NULL::character varying(50) AS servicio,
    NULL::public.dom_especie AS especie,
    NULL::public.dom_tamano AS tamano,
    NULL::public.dom_tipo_pelo AS tipo_pelo,
    NULL::integer AS id_profesional,
    NULL::character varying(250) AS profesional,
    NULL::public.dom_precio AS precio_servicio,
    NULL::numeric AS total_adicionales,
    NULL::numeric AS total;


ALTER VIEW public.v_cita_resumen OWNER TO joux;

--
-- TOC entry 229 (class 1259 OID 20594)
-- Name: variante_servicio; Type: TABLE; Schema: public; Owner: joux
--

CREATE TABLE public.variante_servicio (
    id_variante_servicio integer NOT NULL,
    id_servicio_principal integer NOT NULL,
    especie public.dom_especie NOT NULL,
    tamano public.dom_tamano,
    tipo_pelo public.dom_tipo_pelo,
    precio public.dom_precio NOT NULL,
    duracion_minutos smallint DEFAULT 60 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_variante_duracion CHECK (((duracion_minutos >= 5) AND (duracion_minutos <= 600)))
);


ALTER TABLE public.variante_servicio OWNER TO joux;

--
-- TOC entry 228 (class 1259 OID 20593)
-- Name: variante_servicio_id_variante_servicio_seq; Type: SEQUENCE; Schema: public; Owner: joux
--

ALTER TABLE public.variante_servicio ALTER COLUMN id_variante_servicio ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.variante_servicio_id_variante_servicio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3935 (class 0 OID 20507)
-- Dependencies: 221
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.admin (id_admin, usuario, nombre, email, contrasena, rol, foto_perfil, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3950 (class 0 OID 20702)
-- Dependencies: 236
-- Data for Name: calificacion; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.calificacion (id_calificacion, id_cita, puntuacion, observacion, fecha_calificacion) FROM stdin;
\.


--
-- TOC entry 3947 (class 0 OID 20642)
-- Dependencies: 233
-- Data for Name: cita; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.cita (id_cita, id_mascota, id_variante_servicio, id_profesional, fecha_hora_inicio, fecha_hora_fin, precio_servicio, estado, observacion_cliente, observacion_profesional, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3948 (class 0 OID 20681)
-- Dependencies: 234
-- Data for Name: cita_adicional; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.cita_adicional (id_cita, id_servicio_adicional, precio_cobrado) FROM stdin;
\.


--
-- TOC entry 3952 (class 0 OID 20721)
-- Dependencies: 238
-- Data for Name: cita_historial_estado; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.cita_historial_estado (id_historial, id_cita, estado_anterior, estado_nuevo, origen, id_admin, observacion, fecha_cambio) FROM stdin;
\.


--
-- TOC entry 3937 (class 0 OID 20529)
-- Dependencies: 223
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.cliente (id_cliente, nombre, email, contrasena, celular, direccion, latitud, longitud, foto_perfil, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Ana Pérez	ana@correo.com	$argon2id$v=19$m=19456,p=1,t=2$wZ0Rz/XKNhuRLmdkJ8MmAg$F7Ob+HiwhbkuH9tvf1d7vZOZIZykBLWWaDbb8ACud2Y	0991234567	\N	\N	\N	\N	t	2026-10-31 16:04:19.902783-05	2026-10-31 16:04:19.902783-05
\.


--
-- TOC entry 3939 (class 0 OID 20554)
-- Dependencies: 225
-- Data for Name: mascota; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.mascota (id_mascota, id_cliente, nombre, especie, raza, fecha_nacimiento, tamano, tipo_pelo, foto_perfil, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3945 (class 0 OID 20622)
-- Dependencies: 231
-- Data for Name: servicio_adicional; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.servicio_adicional (id_servicio_adicional, nombre, descripcion, precio, duracion_minutos, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3941 (class 0 OID 20578)
-- Dependencies: 227
-- Data for Name: servicio_principal; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.servicio_principal (id_servicio_principal, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3943 (class 0 OID 20594)
-- Dependencies: 229
-- Data for Name: variante_servicio; Type: TABLE DATA; Schema: public; Owner: joux
--

COPY public.variante_servicio (id_variante_servicio, id_servicio_principal, especie, tamano, tipo_pelo, precio, duracion_minutos, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 220
-- Name: admin_id_admin_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.admin_id_admin_seq', 1, false);


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 235
-- Name: calificacion_id_calificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.calificacion_id_calificacion_seq', 1, false);


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 237
-- Name: cita_historial_estado_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.cita_historial_estado_id_historial_seq', 1, false);


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 232
-- Name: cita_id_cita_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.cita_id_cita_seq', 1, false);


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 222
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.cliente_id_cliente_seq', 1, true);


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 224
-- Name: mascota_id_mascota_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.mascota_id_mascota_seq', 1, false);


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 230
-- Name: servicio_adicional_id_servicio_adicional_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.servicio_adicional_id_servicio_adicional_seq', 1, false);


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 226
-- Name: servicio_principal_id_servicio_principal_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.servicio_principal_id_servicio_principal_seq', 1, false);


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 228
-- Name: variante_servicio_id_variante_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: joux
--

SELECT pg_catalog.setval('public.variante_servicio_id_variante_servicio_seq', 1, false);


--
-- TOC entry 3727 (class 2606 OID 20527)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id_admin);


--
-- TOC entry 3762 (class 2606 OID 20712)
-- Name: calificacion calificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT calificacion_pkey PRIMARY KEY (id_calificacion);


--
-- TOC entry 3766 (class 2606 OID 20735)
-- Name: cita_historial_estado cita_historial_estado_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT cita_historial_estado_pkey PRIMARY KEY (id_historial);


--
-- TOC entry 3748 (class 2606 OID 20661)
-- Name: cita cita_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT cita_pkey PRIMARY KEY (id_cita);


--
-- TOC entry 3731 (class 2606 OID 20552)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 3750 (class 2606 OID 20665)
-- Name: cita excl_cita_mascota_solapada; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT excl_cita_mascota_solapada EXCLUDE USING gist (id_mascota WITH =, tstzrange(fecha_hora_inicio, fecha_hora_fin, '[)'::text) WITH &&) WHERE (((estado)::text <> ALL ((ARRAY['cancelada'::character varying, 'no_asistio'::character varying])::text[])));


--
-- TOC entry 3752 (class 2606 OID 20663)
-- Name: cita excl_cita_profesional_solapada; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT excl_cita_profesional_solapada EXCLUDE USING gist (id_profesional WITH =, tstzrange(fecha_hora_inicio, fecha_hora_fin, '[)'::text) WITH &&) WHERE (((id_profesional IS NOT NULL) AND ((estado)::text <> ALL ((ARRAY['cancelada'::character varying, 'no_asistio'::character varying])::text[]))));


--
-- TOC entry 3735 (class 2606 OID 20571)
-- Name: mascota mascota_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.mascota
    ADD CONSTRAINT mascota_pkey PRIMARY KEY (id_mascota);


--
-- TOC entry 3760 (class 2606 OID 20690)
-- Name: cita_adicional pk_cita_adicional; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT pk_cita_adicional PRIMARY KEY (id_cita, id_servicio_adicional);


--
-- TOC entry 3745 (class 2606 OID 20640)
-- Name: servicio_adicional servicio_adicional_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.servicio_adicional
    ADD CONSTRAINT servicio_adicional_pkey PRIMARY KEY (id_servicio_adicional);


--
-- TOC entry 3737 (class 2606 OID 20592)
-- Name: servicio_principal servicio_principal_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.servicio_principal
    ADD CONSTRAINT servicio_principal_pkey PRIMARY KEY (id_servicio_principal);


--
-- TOC entry 3764 (class 2606 OID 20714)
-- Name: calificacion uq_calificacion_cita; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT uq_calificacion_cita UNIQUE (id_cita);


--
-- TOC entry 3741 (class 2606 OID 20615)
-- Name: variante_servicio uq_variante_servicio; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT uq_variante_servicio UNIQUE NULLS NOT DISTINCT (id_servicio_principal, especie, tamano, tipo_pelo);


--
-- TOC entry 3743 (class 2606 OID 20613)
-- Name: variante_servicio variante_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT variante_servicio_pkey PRIMARY KEY (id_variante_servicio);


--
-- TOC entry 3758 (class 1259 OID 20758)
-- Name: idx_cita_adicional_servicio; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_adicional_servicio ON public.cita_adicional USING btree (id_servicio_adicional);


--
-- TOC entry 3753 (class 1259 OID 20757)
-- Name: idx_cita_estado; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_estado ON public.cita USING btree (estado);


--
-- TOC entry 3754 (class 1259 OID 20756)
-- Name: idx_cita_inicio; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_inicio ON public.cita USING btree (fecha_hora_inicio);


--
-- TOC entry 3755 (class 1259 OID 20753)
-- Name: idx_cita_mascota; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_mascota ON public.cita USING btree (id_mascota);


--
-- TOC entry 3756 (class 1259 OID 20755)
-- Name: idx_cita_profesional_inicio; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_profesional_inicio ON public.cita USING btree (id_profesional, fecha_hora_inicio);


--
-- TOC entry 3757 (class 1259 OID 20754)
-- Name: idx_cita_variante; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_cita_variante ON public.cita USING btree (id_variante_servicio);


--
-- TOC entry 3767 (class 1259 OID 20760)
-- Name: idx_historial_admin; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_historial_admin ON public.cita_historial_estado USING btree (id_admin);


--
-- TOC entry 3768 (class 1259 OID 20759)
-- Name: idx_historial_cita; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_historial_cita ON public.cita_historial_estado USING btree (id_cita);


--
-- TOC entry 3733 (class 1259 OID 20751)
-- Name: idx_mascota_cliente; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_mascota_cliente ON public.mascota USING btree (id_cliente);


--
-- TOC entry 3739 (class 1259 OID 20752)
-- Name: idx_variante_servicio_ppal; Type: INDEX; Schema: public; Owner: joux
--

CREATE INDEX idx_variante_servicio_ppal ON public.variante_servicio USING btree (id_servicio_principal);


--
-- TOC entry 3728 (class 1259 OID 20747)
-- Name: uq_admin_email; Type: INDEX; Schema: public; Owner: joux
--

CREATE UNIQUE INDEX uq_admin_email ON public.admin USING btree (lower((email)::text));


--
-- TOC entry 3729 (class 1259 OID 20746)
-- Name: uq_admin_usuario; Type: INDEX; Schema: public; Owner: joux
--

CREATE UNIQUE INDEX uq_admin_usuario ON public.admin USING btree (lower((usuario)::text));


--
-- TOC entry 3732 (class 1259 OID 20748)
-- Name: uq_cliente_email; Type: INDEX; Schema: public; Owner: joux
--

CREATE UNIQUE INDEX uq_cliente_email ON public.cliente USING btree (lower((email)::text));


--
-- TOC entry 3746 (class 1259 OID 20750)
-- Name: uq_servicio_adicional_nom; Type: INDEX; Schema: public; Owner: joux
--

CREATE UNIQUE INDEX uq_servicio_adicional_nom ON public.servicio_adicional USING btree (lower((nombre)::text));


--
-- TOC entry 3738 (class 1259 OID 20749)
-- Name: uq_servicio_principal_nom; Type: INDEX; Schema: public; Owner: joux
--

CREATE UNIQUE INDEX uq_servicio_principal_nom ON public.servicio_principal USING btree (lower((nombre)::text));


--
-- TOC entry 3933 (class 2618 OID 20771)
-- Name: v_cita_resumen _RETURN; Type: RULE; Schema: public; Owner: joux
--

CREATE OR REPLACE VIEW public.v_cita_resumen AS
 SELECT c.id_cita,
    c.fecha_hora_inicio,
    c.fecha_hora_fin,
    c.estado,
    cl.id_cliente,
    cl.nombre AS cliente,
    m.id_mascota,
    m.nombre AS mascota,
    sp.nombre AS servicio,
    v.especie,
    v.tamano,
    v.tipo_pelo,
    c.id_profesional,
    a.nombre AS profesional,
    c.precio_servicio,
    COALESCE(sum((ca.precio_cobrado)::numeric), (0)::numeric) AS total_adicionales,
    ((c.precio_servicio)::numeric + COALESCE(sum((ca.precio_cobrado)::numeric), (0)::numeric)) AS total
   FROM ((((((public.cita c
     JOIN public.mascota m ON ((m.id_mascota = c.id_mascota)))
     JOIN public.cliente cl ON ((cl.id_cliente = m.id_cliente)))
     JOIN public.variante_servicio v ON ((v.id_variante_servicio = c.id_variante_servicio)))
     JOIN public.servicio_principal sp ON ((sp.id_servicio_principal = v.id_servicio_principal)))
     LEFT JOIN public.admin a ON ((a.id_admin = c.id_profesional)))
     LEFT JOIN public.cita_adicional ca ON ((ca.id_cita = c.id_cita)))
  GROUP BY c.id_cita, cl.id_cliente, m.id_mascota, v.id_variante_servicio, sp.id_servicio_principal, a.id_admin;


--
-- TOC entry 3779 (class 2620 OID 20761)
-- Name: admin trg_admin_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_admin_actualizacion BEFORE UPDATE ON public.admin FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3785 (class 2620 OID 20767)
-- Name: cita trg_cita_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_cita_actualizacion BEFORE UPDATE ON public.cita FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3780 (class 2620 OID 20762)
-- Name: cliente trg_cliente_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_cliente_actualizacion BEFORE UPDATE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3781 (class 2620 OID 20763)
-- Name: mascota trg_mascota_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_mascota_actualizacion BEFORE UPDATE ON public.mascota FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3784 (class 2620 OID 20766)
-- Name: servicio_adicional trg_servicio_adicional_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_servicio_adicional_actualizacion BEFORE UPDATE ON public.servicio_adicional FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3782 (class 2620 OID 20764)
-- Name: servicio_principal trg_servicio_principal_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_servicio_principal_actualizacion BEFORE UPDATE ON public.servicio_principal FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3783 (class 2620 OID 20765)
-- Name: variante_servicio trg_variante_servicio_actualizacion; Type: TRIGGER; Schema: public; Owner: joux
--

CREATE TRIGGER trg_variante_servicio_actualizacion BEFORE UPDATE ON public.variante_servicio FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 3776 (class 2606 OID 20715)
-- Name: calificacion fk_calificacion_cita; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT fk_calificacion_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3774 (class 2606 OID 20691)
-- Name: cita_adicional fk_cita_adicional_cita; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT fk_cita_adicional_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3775 (class 2606 OID 20696)
-- Name: cita_adicional fk_cita_adicional_servicio; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT fk_cita_adicional_servicio FOREIGN KEY (id_servicio_adicional) REFERENCES public.servicio_adicional(id_servicio_adicional) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3771 (class 2606 OID 20666)
-- Name: cita fk_cita_mascota; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_mascota FOREIGN KEY (id_mascota) REFERENCES public.mascota(id_mascota) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3772 (class 2606 OID 20676)
-- Name: cita fk_cita_profesional; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_profesional FOREIGN KEY (id_profesional) REFERENCES public.admin(id_admin) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3773 (class 2606 OID 20671)
-- Name: cita fk_cita_variante; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_variante FOREIGN KEY (id_variante_servicio) REFERENCES public.variante_servicio(id_variante_servicio) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3777 (class 2606 OID 20741)
-- Name: cita_historial_estado fk_historial_admin; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT fk_historial_admin FOREIGN KEY (id_admin) REFERENCES public.admin(id_admin) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3778 (class 2606 OID 20736)
-- Name: cita_historial_estado fk_historial_cita; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT fk_historial_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3769 (class 2606 OID 20572)
-- Name: mascota fk_mascota_cliente; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.mascota
    ADD CONSTRAINT fk_mascota_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3770 (class 2606 OID 20616)
-- Name: variante_servicio fk_variante_servicio_principal; Type: FK CONSTRAINT; Schema: public; Owner: joux
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT fk_variante_servicio_principal FOREIGN KEY (id_servicio_principal) REFERENCES public.servicio_principal(id_servicio_principal) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-11-01 11:19:26 -05

--
-- PostgreSQL database dump complete
--

\unrestrict ROqdHFpWOtCFKjBFlopcTHccO7iNz2nobUXjNaK40Xfil4xoyQ7dfs5IRnCuCOR

