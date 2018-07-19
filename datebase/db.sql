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
-- Name: fid_sid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fid_sid_idx ON fid USING btree (sid);

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

-- 流sql

CREATE TABLE timeline (
    taxid text NOT NULL,
    description text,
    tid text UNIQUE,
    t_created timestamp without time zone,
    t_modified timestamp without time zone
);

ALTER TABLE ONLY timeline
    ADD CONSTRAINT timeline_pkey PRIMARY KEY (taxid);

COMMENT ON COLUMN timeline.taxid IS '时间轴id:';
COMMENT ON COLUMN timeline.description IS '时间轴描述:';
COMMENT ON COLUMN timeline.tid IS '时间轴的设备标识:';
COMMENT ON COLUMN timeline.t_created IS '时间轴创建时间:';
COMMENT ON COLUMN timeline.t_modified IS '时间轴修改时间:';


CREATE TABLE stream (
    streamid text NOT NULL,
    name text,
    chid text,
    type text,
    format text,
    taxid text NOT NULL REFERENCES timeline(taxid),
    t_created timestamp without time zone,
    t_modified timestamp without time zone
);

ALTER TABLE ONLY stream
    ADD CONSTRAINT stream_pkey PRIMARY KEY (streamid);

ALTER TABLE stream ADD CONSTRAINT uk_tbl_unique_host unique (protocol,ip,port);


CREATE INDEX stream_taxid_idx ON stream USING btree (taxid);

COMMENT ON COLUMN stream.streamid IS '流id:';
COMMENT ON COLUMN stream.description IS '流描述:';
COMMENT ON COLUMN stream.identification IS '流通道:';
COMMENT ON COLUMN stream.taxid IS '流绑定的时间轴tid:';
COMMENT ON COLUMN stream.t_created IS '流创建时间:';
COMMENT ON COLUMN stream.t_modified IS '流修改时间:';

-- 创建块表
CREATE TABLE block
(
    bid text NOT NULL PRIMARY KEY,
    storage text NOT NULL REFERENCES storage(tid),
    fid text ,
    streamid text ,
    hash text,
    size bigint,
    sequence int default 0,
    frames int default 0,
    sample_rate int default 0,
    meta jsonb default '{}',
    t_upload timestamp without time zone,
    t_start bigint,
    t_end bigint
);

CREATE INDEX block_bid_idx ON block USING btree (bid);
CREATE INDEX block_fid_idx ON block USING btree (fid);
CREATE INDEX block_sid_idx ON block USING btree (streamid);
CREATE INDEX block_storage_idx ON block USING btree (storage);

COMMENT ON COLUMN block.bid IS '块id:';
COMMENT ON COLUMN block.storage IS '块存储的位置:';
COMMENT ON COLUMN block.fid IS '对应的文件的fid:';
COMMENT ON COLUMN block.streamid IS '对应的流的id:';
COMMENT ON COLUMN block.hash IS '块的哈希值:';
COMMENT ON COLUMN block.size IS '块的大小:';
COMMENT ON COLUMN block.t_upload IS '上传时间:';
COMMENT ON COLUMN block.sequence IS '块的序号: 适用于大文件分块';
COMMENT ON COLUMN block.meta IS '块内存储内容的信息：对于流存储的是流内帧信息';
COMMENT ON COLUMN block.t_start IS '块内帧的起始时间: 适用流';
COMMENT ON COLUMN block.t_end IS '块内帧的结束时间: 适用流';


