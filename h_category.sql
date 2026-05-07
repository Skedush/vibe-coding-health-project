/*
Navicat MySQL Data Transfer

Source Server         : root
Source Server Version : 50729
Source Host           : localhost:3306
Source Database       : health

Target Server Type    : MYSQL
Target Server Version : 50729
File Encoding         : 65001

Date: 2026-05-05 17:11:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `h_category`
-- ----------------------------
DROP TABLE IF EXISTS `h_category`;
CREATE TABLE `h_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `is_delete` tinyint(1) NOT NULL,
  `child_link` varchar(100) DEFAULT NULL,
  `has_user_rule` tinyint(1) NOT NULL,
  `link` varchar(100) DEFAULT NULL,
  `protocol` varchar(100) DEFAULT NULL,
  `show_count` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of h_category
-- ----------------------------
INSERT INTO `h_category` VALUES ('3', '272症状', '2020-01-26 05:37:11.594142', '2020-01-26 05:37:11.594217', '0', '', '1', '', 'https://', '0');
INSERT INTO `h_category` VALUES ('4', '病因', '2020-01-26 05:37:43.343524', '2022-02-14 14:11:55.654458', '0', '.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=158', 'https://', '1');
INSERT INTO `h_category` VALUES ('5', '脏腑', '2020-01-26 05:37:51.733527', '2022-02-15 10:23:13.167510', '0', null, '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=159', 'https://', '0');
INSERT INTO `h_category` VALUES ('6', '320病因', '2020-10-21 20:40:05.863590', '2020-10-21 20:40:05.863590', '0', '', '1', '', 'https://', '0');
INSERT INTO `h_category` VALUES ('7', '320症状', '2020-12-19 18:03:12.996740', '2022-02-14 14:13:59.954515', '1', '.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=263', 'https://', '0');
INSERT INTO `h_category` VALUES ('8', '体质', '2020-12-19 19:05:12.935718', '2022-02-15 11:03:11.858487', '0', 'https://www.cjsq.net/xx/search.asp?ClassID=169&Title=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=169', 'https://', '0');
INSERT INTO `h_category` VALUES ('9', '禁忌', '2021-02-16 22:12:38.526191', '2022-02-15 11:17:23.727304', '0', 'www.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=263', 'https://', '2');
INSERT INTO `h_category` VALUES ('10', '情绪', '2021-02-16 22:12:52.120289', '2022-02-15 11:21:24.393017', '0', 'www.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/Search.asp?ModuleName=article&Field=Title&Keyword=%C7%E9%D0%F7', 'https://', '0');
INSERT INTO `h_category` VALUES ('11', '习惯', '2021-02-16 22:13:08.995721', '2022-02-20 14:55:41.485362', '0', 'www.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/S/ShowClass.asp?ClassID=297', 'https://', '1');
INSERT INTO `h_category` VALUES ('12', '注意', '2021-02-16 22:13:14.933373', '2022-02-15 11:15:45.792311', '0', 'www.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=263', 'https://', '1');
INSERT INTO `h_category` VALUES ('13', '趋势', '2021-02-16 22:13:19.996003', '2022-02-15 11:22:31.391302', '0', 'www.cjsq.net/xx/search.asp?ClassID=263&Content=', '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=263', 'https://', '2');
INSERT INTO `h_category` VALUES ('14', '营养', '2021-02-16 22:14:07.419092', '2022-02-20 14:54:53.640387', '0', null, '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=300', 'https://', '0');
INSERT INTO `h_category` VALUES ('15', '矿物质', '2021-09-19 13:08:21.200563', '2022-02-15 11:25:25.433722', '0', null, '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=269', 'https://', '2');
INSERT INTO `h_category` VALUES ('16', '维生素', '2021-09-19 13:08:32.825860', '2022-02-15 11:25:12.074689', '0', null, '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=268', 'https://', '2');
INSERT INTO `h_category` VALUES ('17', '习惯自检表', '2021-12-21 07:50:06.495523', '2022-02-20 14:44:18.264747', '0', 'www.cjsq.net/S/search.asp?ClassID=279&Title=', '0', 'www.cjsq.net/S/ShowClass.asp?ClassID=279', 'https://', '0');
INSERT INTO `h_category` VALUES ('18', '危害', '2022-01-23 17:34:47.000000', '2022-02-20 11:33:20.145325', '0', '.cjsq.net/s/search.asp?ClassID=279&Content=', '1', '.cjsq.net/s/ShowClass.asp?ClassID=279', 'https://', '2');
INSERT INTO `h_category` VALUES ('19', '深睡眠质量评估表', '2022-03-05 16:27:24.228387', '2022-03-05 16:30:56.937607', '0', null, '0', 'www.cjsq.net/xx/ShowClass.asp?ClassID=303', 'https://', '0');
INSERT INTO `h_category` VALUES ('20', '统计', '2022-03-05 17:20:20.118753', '2022-03-05 17:20:20.118753', '0', null, '0', 'www.cjsq.net', 'https://', '0');
INSERT INTO `h_category` VALUES ('21', '消化系统', '2023-08-20 09:20:29.827488', '2023-08-20 09:20:29.827488', '0', null, '1', null, 'https://', '0');
