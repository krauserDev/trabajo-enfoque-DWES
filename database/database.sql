-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-12-2025 a las 13:02:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda_zapatillas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id`, `usuario_id`, `producto_id`, `cantidad`) VALUES
(19, 2, 10, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `direccion` text NOT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `total`, `direccion`, `estado`, `created_at`) VALUES
(1, 3, 89.99, 'calle alcorcon', 'pendiente', '2025-11-29 18:13:11'),
(2, 3, 249.98, 'calle hola', 'pendiente', '2025-11-30 09:26:50'),
(3, 2, 89.99, 'calle hola', 'pendiente', '2025-11-30 10:06:37'),
(8, 4, 74.99, 'hy', 'pendiente', '2025-12-01 10:13:38'),
(9, 4, 74.99, 'as', 'pendiente', '2025-12-01 10:15:27'),
(10, 2, 149.99, 'hola bebessssss', 'pendiente', '2025-12-01 12:57:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_items`
--

CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_items`
--

INSERT INTO `pedido_items` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio`) VALUES
(1, 1, 4, 1, 89.99),
(2, 2, 3, 1, 159.99),
(3, 2, 4, 1, 89.99),
(4, 3, 4, 1, 89.99),
(9, 8, 10, 1, 74.99),
(10, 9, 10, 1, 74.99),
(11, 10, 12, 1, 149.99);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `marca`, `precio`, `imagen`, `descripcion`, `stock`, `activo`) VALUES
(1, 'Air Max 270', 'Nike', 149.99, 'http://localhost/prj/trabajoServidor/images/productos/nike-air-max.jpg', 'Zapatillas deportivas con amortiguación Air', 15, 1),
(2, 'Ultra Boost', 'Adidas', 179.99, 'http://localhost/prj/trabajoServidor/images/productos/adidas-ultraboost.jpg', 'Máxima amortiguación y retorno de energía', 10, 1),
(3, 'Gel-Kayano 29', 'Asics', 159.99, 'http://localhost/prj/trabajoServidor/images/productos/asics-gel-kayano.jpg', 'Zapatillas para running profesional', 8, 1),
(4, 'Classic Leather', 'Reebok', 89.99, 'http://localhost/prj/trabajoServidor/images/productos/reebok-classic.jpg', 'Estilo clásico y atemporal', 20, 1),
(5, '574 Core', 'New Balance', 99.99, 'http://localhost/prj/trabajoServidor/images/productos/newbalance-574.jpg', 'Comodidad para uso diario', 12, 1),
(6, 'Suede Classic', 'Puma', 79.99, 'http://localhost/prj/trabajoServidor/images/productos/puma-suede.jpg', 'Diseño icónico en gamuza', 18, 1),
(7, 'React Infinity Run', 'Nike', 139.99, 'http://localhost/prj/trabajoServidor/images/productos/nike-react.jpg', 'Zapatillas de running con amortiguación React.', 15, 1),
(8, 'Superstar Classic', 'Adidas', 89.99, 'http://localhost/prj/trabajoServidor/images/productos/adidas-superstar.jpg', 'Icónicas zapatillas urbanas.', 25, 1),
(9, 'Air Jordan 1', 'Nike', 189.99, 'http://localhost/prj/trabajoServidor/images/productos/jordan-1.jpg', 'Zapatillas legendarias de baloncesto.', 8, 1),
(10, 'Old Skool', 'Vans', 74.99, 'http://localhost/prj/trabajoServidor/images/productos/vans-oldskool.jpg', 'Clásicas zapatillas de skate.', 28, 1),
(11, 'Chuck Taylor', 'Converse', 64.99, 'http://localhost/prj/trabajoServidor/images/productos/converse-chuck.jpg', 'El clásico absoluto desde 1917.', 40, 1),
(12, 'Clifton 10', 'Hoka', 149.99, 'http://localhost/prj/trabajoServidor/images/productos/hoka-clifton-10.jpg', 'El Clásico Renace con Comodidad Superior.', 24, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('cliente','admin') DEFAULT 'cliente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `tipo`, `created_at`) VALUES
(2, 'Alberto', 'admin@davante.com', '$2y$10$lE3ZwLcXiXjbxLjNrCwaou5BnWF4jW99lTISGg5Dvbo3SerTDrMEG', 'admin', '2025-11-29 18:02:39'),
(3, 'albertoUsuario', 'alberto_lt90@hotmail.com', '$2y$10$dgaAahR/JjzH8poQp2sMDe170ZRMgxIRtV5ZpNcAT1l2Dxk9WLOXi', 'cliente', '2025-11-29 18:12:43'),
(4, 'Laura', 'laura@usuario.com', '$2y$10$VGtUZBVFOolW0j1r5rcJJuwIjMNqHxRBaC104HHlZsWiTceajooEC', 'cliente', '2025-12-01 10:11:29');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD CONSTRAINT `pedido_items_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
