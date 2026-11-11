--
-- PostgreSQL database dump
--

\restrict Ag93nUhvg1dXf224RTaF170zSGaJS8nBGkm4SmBN8piLdZB9kKQG7KSeYGE9qQF

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-11 07:34:37

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
-- TOC entry 2 (class 3079 OID 16640)
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- TOC entry 1097 (class 1247 OID 17367)
-- Name: dom_email; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_email AS character varying(250)
	CONSTRAINT dom_email_check CHECK (((VALUE)::text ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text));


ALTER DOMAIN public.dom_email OWNER TO postgres;

--
-- TOC entry 1101 (class 1247 OID 17370)
-- Name: dom_especie; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_especie AS character varying(20)
	CONSTRAINT dom_especie_check CHECK (((VALUE)::text = ANY (ARRAY[('perro'::character varying)::text, ('gato'::character varying)::text])));


ALTER DOMAIN public.dom_especie OWNER TO postgres;

--
-- TOC entry 1105 (class 1247 OID 17373)
-- Name: dom_estado_cita; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_estado_cita AS character varying(20)
	CONSTRAINT dom_estado_cita_check CHECK (((VALUE)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('confirmada'::character varying)::text, ('en_proceso'::character varying)::text, ('completada'::character varying)::text, ('cancelada'::character varying)::text, ('no_asistio'::character varying)::text])));


ALTER DOMAIN public.dom_estado_cita OWNER TO postgres;

--
-- TOC entry 1109 (class 1247 OID 17376)
-- Name: dom_precio; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_precio AS numeric(10,2)
	CONSTRAINT dom_precio_check CHECK ((VALUE >= (0)::numeric));


ALTER DOMAIN public.dom_precio OWNER TO postgres;

--
-- TOC entry 1113 (class 1247 OID 17379)
-- Name: dom_tamano; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_tamano AS character varying(20)
	CONSTRAINT dom_tamano_check CHECK (((VALUE)::text = ANY ((ARRAY['mini'::character varying, 'pequeno'::character varying, 'mediano'::character varying, 'grande'::character varying, 'gigante'::character varying])::text[])));


ALTER DOMAIN public.dom_tamano OWNER TO postgres;

--
-- TOC entry 1117 (class 1247 OID 17382)
-- Name: dom_tipo_pelo; Type: DOMAIN; Schema: public; Owner: postgres
--

CREATE DOMAIN public.dom_tipo_pelo AS character varying(20)
	CONSTRAINT dom_tipo_pelo_check CHECK (((VALUE)::text = ANY (ARRAY[('corto'::character varying)::text, ('medio'::character varying)::text, ('largo'::character varying)::text])));


ALTER DOMAIN public.dom_tipo_pelo OWNER TO postgres;

--
-- TOC entry 415 (class 1255 OID 17384)
-- Name: fn_set_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_set_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_set_fecha_actualizacion() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 17385)
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
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
    telefono character varying(10),
    CONSTRAINT chk_admin_rol CHECK (((rol)::text = ANY (ARRAY[('administrador'::character varying)::text, ('profesional'::character varying)::text])))
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17404)
-- Name: admin_id_admin_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 222 (class 1259 OID 17405)
-- Name: calificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calificacion (
    id_calificacion integer NOT NULL,
    id_cita integer NOT NULL,
    puntuacion smallint NOT NULL,
    observacion character varying(250),
    fecha_calificacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_calificacion_puntuacion CHECK (((puntuacion >= 1) AND (puntuacion <= 5)))
);


ALTER TABLE public.calificacion OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17414)
-- Name: calificacion_id_calificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 224 (class 1259 OID 17415)
-- Name: cita; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.cita OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17433)
-- Name: cita_adicional; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cita_adicional (
    id_cita integer NOT NULL,
    id_servicio_adicional integer NOT NULL,
    precio_cobrado public.dom_precio NOT NULL
);


ALTER TABLE public.cita_adicional OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17441)
-- Name: cita_historial_estado; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT chk_historial_origen CHECK (((origen)::text = ANY (ARRAY[('cliente'::character varying)::text, ('admin'::character varying)::text, ('sistema'::character varying)::text])))
);


ALTER TABLE public.cita_historial_estado OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17454)
-- Name: cita_historial_estado_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 228 (class 1259 OID 17455)
-- Name: cita_id_cita_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 229 (class 1259 OID 17456)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17475)
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 231 (class 1259 OID 17476)
-- Name: mascota; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.mascota OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17492)
-- Name: mascota_id_mascota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 233 (class 1259 OID 17493)
-- Name: servicio_adicional; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_adicional (
    id_servicio_adicional integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(500),
    precio public.dom_precio NOT NULL,
    duracion_minutos smallint DEFAULT 15,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_adicional_duracion CHECK (((duracion_minutos >= 0) AND (duracion_minutos <= 600)))
);


ALTER TABLE public.servicio_adicional OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17510)
-- Name: servicio_adicional_id_servicio_adicional_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 235 (class 1259 OID 17511)
-- Name: servicio_principal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_principal (
    id_servicio_principal integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(500),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.servicio_principal OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17524)
-- Name: servicio_principal_id_servicio_principal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 237 (class 1259 OID 17525)
-- Name: v_cita_resumen; Type: VIEW; Schema: public; Owner: postgres
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


ALTER VIEW public.v_cita_resumen OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17529)
-- Name: variante_servicio; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.variante_servicio OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17547)
-- Name: variante_servicio_id_variante_servicio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- TOC entry 5464 (class 0 OID 17385)
-- Dependencies: 220
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (id_admin, usuario, nombre, email, contrasena, rol, foto_perfil, activo, fecha_creacion, fecha_actualizacion, telefono) FROM stdin;
3	edy_flores	Edison Flores	flores_edison@gmail.com	$argon2id$v=19$m=19456,p=1,t=2$ULUD8vDKjgF39s/XT2iHgg$7Xp8KEpMMyd185VG34HD8cb+vvxvAYLRKqK6p94o7wg	administrador	\N	t	2026-11-02 19:00:15.24647-05	2026-11-04 14:50:06.403353-05	0999999999
\.


--
-- TOC entry 5466 (class 0 OID 17405)
-- Dependencies: 222
-- Data for Name: calificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calificacion (id_calificacion, id_cita, puntuacion, observacion, fecha_calificacion) FROM stdin;
\.


--
-- TOC entry 5468 (class 0 OID 17415)
-- Dependencies: 224
-- Data for Name: cita; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cita (id_cita, id_mascota, id_variante_servicio, id_profesional, fecha_hora_inicio, fecha_hora_fin, precio_servicio, estado, observacion_cliente, observacion_profesional, fecha_creacion, fecha_actualizacion) FROM stdin;
1	9	13	3	2026-11-12 09:00:00-05	2026-11-12 10:30:00-05	25.00	cancelada	\N	\N	2026-11-11 01:38:06.035522-05	2026-11-11 03:46:32.184153-05
2	9	13	3	2026-11-12 12:00:00-05	2026-11-12 13:30:00-05	25.00	cancelada	\N	\N	2026-11-11 01:40:59.495632-05	2026-11-11 03:46:38.413845-05
3	9	5	3	2026-11-12 15:00:00-05	2026-11-12 16:30:00-05	25.00	cancelada	\N	\N	2026-11-11 01:44:24.976726-05	2026-11-11 03:47:05.467435-05
4	9	13	3	2026-11-11 09:00:00-05	2026-11-11 10:30:00-05	25.00	cancelada	\N	\N	2026-11-11 03:48:10.166532-05	2026-11-11 03:57:52.225769-05
5	9	13	3	2026-11-11 10:30:00-05	2026-11-11 12:00:00-05	25.00	pendiente	\N	\N	2026-11-11 03:58:08.467928-05	2026-11-11 03:58:08.467928-05
6	9	13	3	2026-11-12 10:30:00-05	2026-11-12 12:00:00-05	25.00	pendiente	\N	\N	2026-11-11 04:03:27.378729-05	2026-11-11 04:03:27.378729-05
7	9	5	3	2026-11-13 12:00:00-05	2026-11-13 13:30:00-05	25.00	pendiente	\N	\N	2026-11-11 04:04:41.307339-05	2026-11-11 04:04:41.307339-05
8	9	2	3	2026-11-15 12:00:00-05	2026-11-15 13:30:00-05	25.00	pendiente	\N	\N	2026-11-11 04:06:01.609192-05	2026-11-11 04:06:01.609192-05
\.


--
-- TOC entry 5469 (class 0 OID 17433)
-- Dependencies: 225
-- Data for Name: cita_adicional; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cita_adicional (id_cita, id_servicio_adicional, precio_cobrado) FROM stdin;
1	6	3.00
1	9	2.50
2	1	5.00
2	5	10.00
3	1	5.00
3	5	10.00
4	1	5.00
4	6	3.00
4	9	2.50
5	1	5.00
6	5	10.00
7	1	5.00
8	2	5.00
\.


--
-- TOC entry 5470 (class 0 OID 17441)
-- Dependencies: 226
-- Data for Name: cita_historial_estado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cita_historial_estado (id_historial, id_cita, estado_anterior, estado_nuevo, origen, id_admin, observacion, fecha_cambio) FROM stdin;
1	1	\N	pendiente	cliente	\N	\N	2026-11-11 01:38:06.035522-05
2	2	\N	pendiente	cliente	\N	\N	2026-11-11 01:40:59.495632-05
3	3	\N	pendiente	cliente	\N	\N	2026-11-11 01:44:24.976726-05
4	1	pendiente	cancelada	cliente	\N	\N	2026-11-11 03:46:32.184153-05
5	2	pendiente	cancelada	cliente	\N	\N	2026-11-11 03:46:38.413845-05
6	3	pendiente	cancelada	cliente	\N	\N	2026-11-11 03:47:05.467435-05
7	4	\N	pendiente	cliente	\N	\N	2026-11-11 03:48:10.166532-05
8	4	pendiente	cancelada	cliente	\N	\N	2026-11-11 03:57:52.225769-05
9	5	\N	pendiente	cliente	\N	\N	2026-11-11 03:58:08.467928-05
10	6	\N	pendiente	cliente	\N	\N	2026-11-11 04:03:27.378729-05
11	7	\N	pendiente	cliente	\N	\N	2026-11-11 04:04:41.307339-05
12	8	\N	pendiente	cliente	\N	\N	2026-11-11 04:06:01.609192-05
\.


--
-- TOC entry 5473 (class 0 OID 17456)
-- Dependencies: 229
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id_cliente, nombre, email, contrasena, celular, direccion, latitud, longitud, foto_perfil, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Ana Pérez	ana@correo.com	$argon2id$v=19$m=19456,p=1,t=2$wZ0Rz/XKNhuRLmdkJ8MmAg$F7Ob+HiwhbkuH9tvf1d7vZOZIZykBLWWaDbb8ACud2Y	0991234588	Av.Alberto Zambrano, al frende de los bomberos la merced	\N	\N	\N	t	2026-10-31 16:04:19.902783-05	2026-11-08 08:14:45.803623-05
4	Fernando Gutierrez	fer123@gmail.com	$argon2id$v=19$m=19456,p=1,t=2$AE+YFy3nbYCRES7Nsk30gA$8MtTxmeOPtD1Z4JogGKtxfeQjifrVn+J7RBspvcJTHg	0999999999	av.las palmas	\N	\N	\N	t	2026-11-08 08:41:24.864545-05	2026-11-10 19:04:44.024936-05
\.


--
-- TOC entry 5475 (class 0 OID 17476)
-- Dependencies: 231
-- Data for Name: mascota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mascota (id_mascota, id_cliente, nombre, especie, raza, fecha_nacimiento, tamano, tipo_pelo, foto_perfil, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
8	1	zeus	perro	poodle	\N	mediano	medio	\N	t	2026-11-08 08:35:20.489815-05	2026-11-08 08:35:20.489815-05
9	4	Toby	perro	Caniche	2023-05-15	mediano	largo	\N	t	2026-11-11 01:26:48.440156-05	2026-11-11 01:26:48.440156-05
\.


--
-- TOC entry 5477 (class 0 OID 17493)
-- Dependencies: 233
-- Data for Name: servicio_adicional; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio_adicional (id_servicio_adicional, nombre, descripcion, precio, duracion_minutos, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Antiparasitario	Aplicación de tratamiento externo para el control de parásitos.	5.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:33:58.554417-05
2	Control de plagas	Tratamiento externo para ayudar a controlar pulgas y garrapatas.	5.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:33:58.554417-05
3	Colorimetría cuatro patas	Aplicación estética de color en las cuatro patas de la mascota.	5.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:33:58.554417-05
6	Transporte	Servicio de transporte puerta a puerta para su mascota.	3.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:36:21.746874-05
5	Colorimetría completo	Servicio de coloración estética full para su mascota.	10.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:36:46.691175-05
4	Colorimetría oreja y cola	Aplicación de color solo en las orejas y la cola.	5.00	15	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:37:22.633975-05
9	Corte de uñas	Es indispensable que su mascota mantenga una buena higiene en sus patitas.	2.50	\N	t	2026-11-03 05:50:17.109847-05	2026-11-03 05:50:17.109847-05
\.


--
-- TOC entry 5479 (class 0 OID 17511)
-- Dependencies: 235
-- Data for Name: servicio_principal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio_principal (id_servicio_principal, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
2	Corte Bajo	Corte de pelaje corto para mantener una apariencia limpia y ordenada.	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:33:58.554417-05
3	Corte Modelo	Corte estético personalizado según las características de la mascota.	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:33:58.554417-05
1	Baño Medicado	Limpieza general del pelaje con productos especializados para mascotas.	t	2026-11-03 05:33:58.554417-05	2026-11-03 05:34:59.068116-05
\.


--
-- TOC entry 5481 (class 0 OID 17529)
-- Dependencies: 238
-- Data for Name: variante_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variante_servicio (id_variante_servicio, id_servicio_principal, especie, tamano, tipo_pelo, precio, duracion_minutos, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	2	perro	pequeno	\N	15.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
2	2	perro	mediano	\N	25.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
3	2	perro	grande	\N	40.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
4	3	perro	pequeno	largo	40.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
5	3	perro	mediano	largo	25.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
6	3	perro	grande	largo	40.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
7	1	perro	mini	corto	10.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
8	1	perro	pequeno	corto	10.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
9	1	perro	mediano	corto	20.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
10	1	perro	grande	corto	35.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
11	1	perro	mini	largo	15.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
12	1	perro	pequeno	largo	15.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
13	1	perro	mediano	largo	25.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
14	1	perro	grande	largo	40.00	90	t	2026-11-10 22:48:29.250498-05	2026-11-10 22:48:29.250498-05
\.


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 221
-- Name: admin_id_admin_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_id_admin_seq', 3, true);


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 223
-- Name: calificacion_id_calificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calificacion_id_calificacion_seq', 1, false);


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 227
-- Name: cita_historial_estado_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cita_historial_estado_id_historial_seq', 12, true);


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 228
-- Name: cita_id_cita_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cita_id_cita_seq', 8, true);


--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 230
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_id_cliente_seq', 4, true);


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 232
-- Name: mascota_id_mascota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mascota_id_mascota_seq', 9, true);


--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 234
-- Name: servicio_adicional_id_servicio_adicional_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_adicional_id_servicio_adicional_seq', 9, true);


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 236
-- Name: servicio_principal_id_servicio_principal_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_principal_id_servicio_principal_seq', 3, true);


--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 239
-- Name: variante_servicio_id_variante_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.variante_servicio_id_variante_servicio_seq', 14, true);


--
-- TOC entry 5257 (class 2606 OID 17549)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id_admin);


--
-- TOC entry 5261 (class 2606 OID 17551)
-- Name: calificacion calificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT calificacion_pkey PRIMARY KEY (id_calificacion);


--
-- TOC entry 5279 (class 2606 OID 17553)
-- Name: cita_historial_estado cita_historial_estado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT cita_historial_estado_pkey PRIMARY KEY (id_historial);


--
-- TOC entry 5265 (class 2606 OID 17555)
-- Name: cita cita_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT cita_pkey PRIMARY KEY (id_cita);


--
-- TOC entry 5283 (class 2606 OID 17557)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 5267 (class 2606 OID 17559)
-- Name: cita excl_cita_mascota_solapada; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT excl_cita_mascota_solapada EXCLUDE USING gist (id_mascota WITH =, tstzrange(fecha_hora_inicio, fecha_hora_fin, '[)'::text) WITH &&) WHERE (((estado)::text <> ALL (ARRAY[('cancelada'::character varying)::text, ('no_asistio'::character varying)::text])));


--
-- TOC entry 5269 (class 2606 OID 17561)
-- Name: cita excl_cita_profesional_solapada; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT excl_cita_profesional_solapada EXCLUDE USING gist (id_profesional WITH =, tstzrange(fecha_hora_inicio, fecha_hora_fin, '[)'::text) WITH &&) WHERE (((id_profesional IS NOT NULL) AND ((estado)::text <> ALL (ARRAY[('cancelada'::character varying)::text, ('no_asistio'::character varying)::text]))));


--
-- TOC entry 5287 (class 2606 OID 17563)
-- Name: mascota mascota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mascota
    ADD CONSTRAINT mascota_pkey PRIMARY KEY (id_mascota);


--
-- TOC entry 5277 (class 2606 OID 17565)
-- Name: cita_adicional pk_cita_adicional; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT pk_cita_adicional PRIMARY KEY (id_cita, id_servicio_adicional);


--
-- TOC entry 5289 (class 2606 OID 17567)
-- Name: servicio_adicional servicio_adicional_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_adicional
    ADD CONSTRAINT servicio_adicional_pkey PRIMARY KEY (id_servicio_adicional);


--
-- TOC entry 5292 (class 2606 OID 17569)
-- Name: servicio_principal servicio_principal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_principal
    ADD CONSTRAINT servicio_principal_pkey PRIMARY KEY (id_servicio_principal);


--
-- TOC entry 5263 (class 2606 OID 17571)
-- Name: calificacion uq_calificacion_cita; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT uq_calificacion_cita UNIQUE (id_cita);


--
-- TOC entry 5296 (class 2606 OID 17573)
-- Name: variante_servicio uq_variante_servicio; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT uq_variante_servicio UNIQUE NULLS NOT DISTINCT (id_servicio_principal, especie, tamano, tipo_pelo);


--
-- TOC entry 5298 (class 2606 OID 17575)
-- Name: variante_servicio variante_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT variante_servicio_pkey PRIMARY KEY (id_variante_servicio);


--
-- TOC entry 5275 (class 1259 OID 17576)
-- Name: idx_cita_adicional_servicio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_adicional_servicio ON public.cita_adicional USING btree (id_servicio_adicional);


--
-- TOC entry 5270 (class 1259 OID 17577)
-- Name: idx_cita_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_estado ON public.cita USING btree (estado);


--
-- TOC entry 5271 (class 1259 OID 17578)
-- Name: idx_cita_inicio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_inicio ON public.cita USING btree (fecha_hora_inicio);


--
-- TOC entry 5272 (class 1259 OID 17579)
-- Name: idx_cita_mascota; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_mascota ON public.cita USING btree (id_mascota);


--
-- TOC entry 5273 (class 1259 OID 17580)
-- Name: idx_cita_profesional_inicio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_profesional_inicio ON public.cita USING btree (id_profesional, fecha_hora_inicio);


--
-- TOC entry 5274 (class 1259 OID 17581)
-- Name: idx_cita_variante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cita_variante ON public.cita USING btree (id_variante_servicio);


--
-- TOC entry 5280 (class 1259 OID 17582)
-- Name: idx_historial_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_admin ON public.cita_historial_estado USING btree (id_admin);


--
-- TOC entry 5281 (class 1259 OID 17583)
-- Name: idx_historial_cita; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_cita ON public.cita_historial_estado USING btree (id_cita);


--
-- TOC entry 5285 (class 1259 OID 17584)
-- Name: idx_mascota_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mascota_cliente ON public.mascota USING btree (id_cliente);


--
-- TOC entry 5294 (class 1259 OID 17585)
-- Name: idx_variante_servicio_ppal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_variante_servicio_ppal ON public.variante_servicio USING btree (id_servicio_principal);


--
-- TOC entry 5258 (class 1259 OID 17586)
-- Name: uq_admin_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_admin_email ON public.admin USING btree (lower((email)::text));


--
-- TOC entry 5259 (class 1259 OID 17587)
-- Name: uq_admin_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_admin_usuario ON public.admin USING btree (lower((usuario)::text));


--
-- TOC entry 5284 (class 1259 OID 17588)
-- Name: uq_cliente_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_cliente_email ON public.cliente USING btree (lower((email)::text));


--
-- TOC entry 5290 (class 1259 OID 17589)
-- Name: uq_servicio_adicional_nom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_servicio_adicional_nom ON public.servicio_adicional USING btree (lower((nombre)::text));


--
-- TOC entry 5293 (class 1259 OID 17590)
-- Name: uq_servicio_principal_nom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_servicio_principal_nom ON public.servicio_principal USING btree (lower((nombre)::text));


--
-- TOC entry 5463 (class 2618 OID 17528)
-- Name: v_cita_resumen _RETURN; Type: RULE; Schema: public; Owner: postgres
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
-- TOC entry 5309 (class 2620 OID 17592)
-- Name: admin trg_admin_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_admin_actualizacion BEFORE UPDATE ON public.admin FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5310 (class 2620 OID 17593)
-- Name: cita trg_cita_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cita_actualizacion BEFORE UPDATE ON public.cita FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5311 (class 2620 OID 17594)
-- Name: cliente trg_cliente_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cliente_actualizacion BEFORE UPDATE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5312 (class 2620 OID 17595)
-- Name: mascota trg_mascota_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_mascota_actualizacion BEFORE UPDATE ON public.mascota FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5313 (class 2620 OID 17596)
-- Name: servicio_adicional trg_servicio_adicional_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_servicio_adicional_actualizacion BEFORE UPDATE ON public.servicio_adicional FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5314 (class 2620 OID 17597)
-- Name: servicio_principal trg_servicio_principal_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_servicio_principal_actualizacion BEFORE UPDATE ON public.servicio_principal FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5315 (class 2620 OID 17598)
-- Name: variante_servicio trg_variante_servicio_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_variante_servicio_actualizacion BEFORE UPDATE ON public.variante_servicio FOR EACH ROW EXECUTE FUNCTION public.fn_set_fecha_actualizacion();


--
-- TOC entry 5299 (class 2606 OID 17599)
-- Name: calificacion fk_calificacion_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificacion
    ADD CONSTRAINT fk_calificacion_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5303 (class 2606 OID 17604)
-- Name: cita_adicional fk_cita_adicional_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT fk_cita_adicional_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5304 (class 2606 OID 17609)
-- Name: cita_adicional fk_cita_adicional_servicio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_adicional
    ADD CONSTRAINT fk_cita_adicional_servicio FOREIGN KEY (id_servicio_adicional) REFERENCES public.servicio_adicional(id_servicio_adicional) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5300 (class 2606 OID 17614)
-- Name: cita fk_cita_mascota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_mascota FOREIGN KEY (id_mascota) REFERENCES public.mascota(id_mascota) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5301 (class 2606 OID 17619)
-- Name: cita fk_cita_profesional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_profesional FOREIGN KEY (id_profesional) REFERENCES public.admin(id_admin) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5302 (class 2606 OID 17624)
-- Name: cita fk_cita_variante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_cita_variante FOREIGN KEY (id_variante_servicio) REFERENCES public.variante_servicio(id_variante_servicio) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5305 (class 2606 OID 17629)
-- Name: cita_historial_estado fk_historial_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT fk_historial_admin FOREIGN KEY (id_admin) REFERENCES public.admin(id_admin) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5306 (class 2606 OID 17634)
-- Name: cita_historial_estado fk_historial_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita_historial_estado
    ADD CONSTRAINT fk_historial_cita FOREIGN KEY (id_cita) REFERENCES public.cita(id_cita) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5307 (class 2606 OID 17639)
-- Name: mascota fk_mascota_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mascota
    ADD CONSTRAINT fk_mascota_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5308 (class 2606 OID 17644)
-- Name: variante_servicio fk_variante_servicio_principal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_servicio
    ADD CONSTRAINT fk_variante_servicio_principal FOREIGN KEY (id_servicio_principal) REFERENCES public.servicio_principal(id_servicio_principal) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-11-11 07:34:38

--
-- PostgreSQL database dump complete
--

\unrestrict Ag93nUhvg1dXf224RTaF170zSGaJS8nBGkm4SmBN8piLdZB9kKQG7KSeYGE9qQF

