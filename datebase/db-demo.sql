--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.4
-- Dumped by pg_dump version 9.5.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE config (
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    comment text
);


--
-- Name: TABLE config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE config IS '系统配置表:系统参数配置key/value';


--
-- Name: COLUMN config.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN config.key IS '关键字:文本类型关键字';


--
-- Name: COLUMN config.value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN config.value IS '参数:必须是合法的JSON字符串';


--
-- Name: COLUMN config.comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN config.comment IS '备注:参数备注说明';


--
-- Name: download; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE download (
    id bigint NOT NULL,
    sid text,
    downloader text,
    fid text,
    t_download timestamp without time zone
);


--
-- Name: TABLE download; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE download IS '下载记录:nil';


--
-- Name: COLUMN download.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN download.id IS ':';


--
-- Name: COLUMN download.sid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN download.sid IS ':';


--
-- Name: COLUMN download.downloader; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN download.downloader IS ':';


--
-- Name: COLUMN download.fid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN download.fid IS ':';


--
-- Name: COLUMN download.t_download; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN download.t_download IS ':';


--
-- Name: download_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE download_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: download_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE download_id_seq OWNED BY download.id;


--
-- Name: fid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE fid (
    fid text NOT NULL,
    hash text,
    storage text,
    fname text,
    type text,
    size bigint,
    uploader jsonb,
    download_count bigint,
    t_upload timestamp without time zone,
    t_expire timestamp without time zone
);


--
-- Name: TABLE fid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE fid IS '文件id:nil';


--
-- Name: COLUMN fid.fid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.fid IS '文件标识:';


--
-- Name: COLUMN fid.hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.hash IS '文件哈希:';


--
-- Name: COLUMN fid.storage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.storage IS '存储服务TID:';


--
-- Name: COLUMN fid.fname; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.fname IS '文件名:';


--
-- Name: COLUMN fid.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.type IS '类型:';


--
-- Name: COLUMN fid.size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.size IS '文件大小:Bytes';


--
-- Name: COLUMN fid.uploader; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.uploader IS '上传者信息:{sid/tid}';


--
-- Name: COLUMN fid.download_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.download_count IS '下载次数:下载计数器';


--
-- Name: COLUMN fid.t_upload; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.t_upload IS '上传时间:';


--
-- Name: COLUMN fid.t_expire; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN fid.t_expire IS '过期时间:过期时间';


--
-- Name: storage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE storage (
    tid text NOT NULL,
    enabled boolean DEFAULT true,
    protocol text DEFAULT 'http'::text,
    hostname text,
    ip text,
    port integer,
    size_total bigint,
    size_used bigint DEFAULT 0,
    size_free bigint,
    note text
);


--
-- Name: TABLE storage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE storage IS '存储服务器信息表:nil';


--
-- Name: COLUMN storage.tid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.tid IS '存储服务TID:';


--
-- Name: COLUMN storage.enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.enabled IS ':';


--
-- Name: COLUMN storage.protocol; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.protocol IS ':';


--
-- Name: COLUMN storage.hostname; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.hostname IS ':';


--
-- Name: COLUMN storage.ip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.ip IS ':';


--
-- Name: COLUMN storage.port; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.port IS ':';


--
-- Name: COLUMN storage.size_total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.size_total IS ':';


--
-- Name: COLUMN storage.size_used; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.size_used IS ':';


--
-- Name: COLUMN storage.size_free; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.size_free IS ':';


--
-- Name: COLUMN storage.note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN storage.note IS ':';


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY download ALTER COLUMN id SET DEFAULT nextval('download_id_seq'::regclass);


--
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY config (key, value, comment) FROM stdin;
server	{"tid": "COWN-YMV-QP-3BL", "hostname": "fs.jingyun.cn"}	\N
owner	"o1000"	\N
\.


--
-- Data for Name: download; Type: TABLE DATA; Schema: public; Owner: -
--

COPY download (id, sid, downloader, fid, t_download) FROM stdin;
\.


--
-- Name: download_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('download_id_seq', 15, true);


--
-- Data for Name: fid; Type: TABLE DATA; Schema: public; Owner: -
--

COPY fid (fid, hash, storage, fname, type, size, uploader, download_count, t_upload, t_expire) FROM stdin;
GHuERymbQIq6J0LSYHiE-g	b55c86be6accbafcb9489fefda5b637f	COWN-GSB-GN-QS2	5522.txt	text/plain	3487	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-06 20:52:14.782275	\N
ScHsqcEsRfa7gEr3gxhErw	c5588a77099eae446ac4a0a2ff34f849	COWN-GSB-GN-QS2	GRIP.log	application/octet-stream	407626	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-06 20:52:15.521046	\N
Ym1HjL4NQS2DtIMmQ42mkQ	9fcca6dc72718ddc97c94dd956c797e2	COWN-GSB-GN-QS2	links.html	text/html	78374	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-06 20:52:15.599412	\N
Dl7YNyATRFCR8yLX2XmJIw	8e38ce071c54f0d64b5ecc1aedd5af5d	COWN-GSB-GN-QS2	pgadmin.log	application/octet-stream	1065	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-06 20:52:15.610401	\N
txAUh9kmRQKov-mz6e+dAw	e76ab772d0d7b05f772071c84ca62174	COWN-LTP-3K-KJ9	31c3-6249-en-de-SS7_Locate_Track_Manipulate_sd.mp4	video/mp4	197096	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-08 16:54:48.089052	\N
flHJBYUwTE+HqqfmWKJGpw	6223b1dc7c8b1d89df07a621372a48da	COWN-FC2-TG-EHU	原版Bad apple.mid	audio/midi	32390	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 16:56:35.709442	\N
PbnUzMkPTPSgibaH1c3OSA	8620b3170bc7277aa261bc9b65d3960b	COWN-FC2-TG-EHU	204-CN0015-1718-200.tid	application/octet-stream	10200	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:07:58.047916	\N
KPPhBIy-QoeXnChfqPHvnw	0eb049dc6a73897b0b696232624bc3cf	COWN-FC2-TG-EHU	216-CN8010-1722-5.tid	application/octet-stream	255	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:09:07.265306	\N
NNIvUfNIRmObZX9-N2k9eg	3b1a4812ad8c3ac3390877201be9a3a8	COWN-FC2-TG-EHU	203-CN1100-1718-500.tid	application/octet-stream	25500	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:10:25.435237	\N
UgrQyHJFSDm4oq7oxLfwqA	17eb63de2e25fe911547d76e5db13d0d	COWN-FC2-TG-EHU	2.jpg	image/jpeg	214526	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:49:30.208116	\N
IxUUAg-XQcKF+ZKqv78I-w	4a3d13414ecbd5d9168fc3f5b077976f	COWN-LTP-3K-KJ9	1.png	image/png	295571	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-08 17:53:20.451224	\N
D7v-L7g8Q4mU7m3qHti8RQ	0e9a823dec0bb3e176ddc8ed5e1a5015	COWN-FC2-TG-EHU	217-CN6111-1723-100.csv	text/csv	6317	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:58:28.327996	\N
iu11LfQ9SWG3SGUlvfTTvw	a5c4b6e9c32fb2fb7f7547bac111ff60	COWN-FC2-TG-EHU	218-CN5040-1723-100.csv	text/csv	4617	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-08 17:58:28.336463	\N
YAh-EqbNTF2L-x9xfsWc6Q	6df6ca75fbb6d447ed26dffeadb1f63c	COWN-FC2-TG-EHU	image.jpeg	image/jpeg	45945	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-09 08:41:24.258131	\N
9pPvHSYyTEGGbv0pGZUP0A	ea3760fa55e048e3ffaad8db91105daa	COWN-FC2-TG-EHU	official transcript request 2017.pdf	application/pdf	233803	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-09 08:42:15.400623	\N
rUmynER5QMWxr3suRajVWw	27b71ae215dc4f9028e2a01f8209d9ec	COWN-GSB-GN-QS2	219-CN8010-1723-5.tid	application/octet-stream	340	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-09 11:01:20.142464	\N
FyXBcwGeRYqS2KLvas8-Gw	6448514d46055f1800a277a9bf961c79	COWN-GSB-GN-QS2	Apple.txt	text/plain	12391	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-09 11:01:20.174442	\N
9bVzGZHNQ6GSdQK9uotxbg	3998bb67bc8b9622a9cf60d0c2658456	COWN-LTP-3K-KJ9	box2-node_modules.tgz	application/x-gzip	1649289	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-09 13:25:11.508981	\N
dL7AaNOyR4Kb24wlRcv-Iw	9cf8493b4fb99bbe1a5ca60046217b77	COWN-GSB-GN-QS2	521_444192_General_NetSDK_Chn_Linux64_IS_V3.46.3.R.160927.tar.gz	application/x-gzip	21173879	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-09 13:28:59.750621	\N
-pznErSGRju4tPYf3ELGQQ	71d489f114e2960a86ab17520ba588e8	COWN-GSB-GN-QS2	2017FRCGameSeasonManual.pdf	application/pdf	11983368	{"tid": "COWN-GSB-GN-QS2"}	\N	2017-06-09 13:32:25.988462	\N
fLHfpFGPQOaLpbJOXWoycg	fa4667d0373c9e612839eb86303e97fd	COWN-FC2-TG-EHU	bad apple.mid	audio/midi	6553	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-09 14:25:41.837655	\N
xImyO4EBTA2zVAG5ynCcSA	627e5d58bd66f479189ad832626af878	COWN-FC2-TG-EHU	bad apple1.mid	audio/midi	12260	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-09 14:25:42.172293	\N
wcho5zXSRwaW1uluQb7tJg	ba0a70d398e7352fcd52b5890f645b50	COWN-FC2-TG-EHU	Screenshot_2017-06-09-14-10-41-290_桌面.png	image/png	3079890	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-10 16:04:53.431165	\N
y8wmOp3fSxCLYthU0JsgOA	456ecaca66627929fc63a2072c871bd1	COWN-LTP-3K-KJ9	220-CN0015-1723-200.tid	application/octet-stream	10200	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:54.69428	\N
wexrcs9CTaOnswzAHlxI9Q	507e072b96af65a2a144131a553fb7ce	COWN-LTP-3K-KJ9	222-CN4008-1724-1000.tid	application/octet-stream	68000	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:54.713458	\N
fEMf-YtMTBa3Dpd69rjB+g	f27508fe3d3d836f75316bc1c65528bd	COWN-LTP-3K-KJ9	221-CN6330-1724-100.csv	text/csv	6317	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:54.733434	\N
rz+MgQKeTzeL8iQLcRlhoQ	6ade05ec4dfca82a5b8e4fbedd1ad674	COWN-LTP-3K-KJ9	221-CN6330-1724-100.tid	application/octet-stream	6800	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:54.756203	\N
O3UwOhJrR727BllLgomkdQ	12da6d85df8874337c045b736abc1a05	COWN-LTP-3K-KJ9	223-CN4108-1724-1000.tid	application/octet-stream	51000	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:55.30049	\N
Ix8mSlbBR7eNOchMD5AX6Q	b0930a2f426c4cb0d6122a3101c2ce74	COWN-LTP-3K-KJ9	224-CN4208-1724-500.tid	application/octet-stream	34000	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:55.622321	\N
5bkISlBgTnizyykFNiBY+w	56e740567b4c2606d46607cb345d0743	COWN-LTP-3K-KJ9	224-CN4208-1724-1000.tid	application/octet-stream	68000	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 10:59:56.089959	\N
Xt2gC1x-QN2hs5TU7Ln-fQ	e486f292c5f232e424bb0764dae7d0a5	COWN-LTP-3K-KJ9	cw.mdb	application/octet-stream	5672960	{"tid": "COWN-LTP-3K-KJ9"}	\N	2017-06-16 21:11:28.727885	\N
vFEBshN+S4i7JsqLYFXjtw	ebe8b6c6346cc97f57799e6ccd7f54e9	COWN-FC2-TG-EHU	226-CN8010-1725-3.csv	text/csv	206	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-20 16:36:31.068482	\N
eNidQj64QbilhOonSt3d7Q	43663f1788524cd807e78e48693a3e96	COWN-FC2-TG-EHU	来自5522的帮助.pdf	application/pdf	419580	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-20 21:07:50.614593	\N
I-84Lj5gTKqskn1ByMQmuw	f3883eebf70644cbc85ba8bac2af7730	COWN-FC2-TG-EHU	225-CN8000-1725-7.csv	text/csv	458	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-20 21:36:51.209899	\N
iMzcqRTzQ1KMv47AJnLMJA	4b61cb305a0baf74db37e343d938ccaa	COWN-FC2-TG-EHU	128-CN6130-1647-350.csv	text/csv	22067	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-20 22:14:52.414466	\N
ao8OSIQQS+63lwF8ptxt7Q	a0f32d6a2fd6fb4d01cdc6b775673391	COWN-FC2-TG-EHU	227-CN6300-1725-100.csv	text/csv	6317	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-28 10:49:37.724916	\N
6W7z3XUyR56+iiC3AQ0rWQ	298e11c30afe7eeafddc61904585e5e8	COWN-FC2-TG-EHU	5522.pdf	application/pdf	190294	{"tid": "COWN-FC2-TG-EHU"}	\N	2017-06-28 10:53:00.972761	\N
\.


--
-- Data for Name: storage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY storage (tid, enabled, protocol, hostname, ip, port, size_total, size_used, size_free, note) FROM stdin;
COWN-GSB-GN-QS2	t	http	fs1.jingyun.cn	122.112.210.133	5001	1073741824	33660530	1040081294	\N
COWN-LTP-3K-KJ9	t	http	fs2.jingyun.cn	119.29.107.58	5001	1073741824	8059233	1065682591	\N
COWN-FC2-TG-EHU	t	http	fs3.jingyun.cn	106.38.208.73	5001	1073741824	4311178	1069430646	\N
\.


--
-- Name: config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY config
    ADD CONSTRAINT config_pkey PRIMARY KEY (key);


--
-- Name: download_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY download
    ADD CONSTRAINT download_pkey PRIMARY KEY (id);


--
-- Name: fid_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY fid
    ADD CONSTRAINT fid_pkey PRIMARY KEY (fid);


--
-- Name: storage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY storage
    ADD CONSTRAINT storage_pkey PRIMARY KEY (tid);


--
-- Name: config_value_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX config_value_idx ON config USING gin (value);


--
-- Name: download_downloader_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX download_downloader_idx ON download USING btree (downloader);


--
-- Name: download_fid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX download_fid_idx ON download USING btree (fid);


--
-- Name: download_sid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX download_sid_idx ON download USING btree (sid);


--
-- Name: fid_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fid_hash_idx ON fid USING btree (hash);


--
-- Name: fid_storage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fid_storage_idx ON fid USING btree (storage);


--
-- Name: storage_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storage_enabled_idx ON storage USING btree (enabled);


--
-- Name: storage_size_free_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storage_size_free_idx ON storage USING btree (size_free);


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

