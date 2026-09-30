<?php
declare(strict_types=1);

namespace HopoShop;

use HopoShop\Utils\Response;

require_once __DIR__ . '/Utils/Response.php';

class Router
{
    private array $routes = [];

    public function addRoute(string $method, string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->routes[] = [
            'method'      => strtoupper($method),
            'path'        => $path,
            'handler'     => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public function get(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function patch(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('PATCH', $path, $handler, $middlewares);
    }

    public function delete(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = parse_url($uri, PHP_URL_PATH) ?? '/';
        $method = strtoupper($method);

        // Normalize base URI if running in subdirectory
        $uri = preg_replace('#^/api/#', '/', $uri);
        $uri = '/' . trim($uri, '/');
        if ($uri === '') {
            $uri = '/';
        }

        // Parse input body
        $rawBody = file_get_contents('php://input');
        $jsonBody = json_decode($rawBody, true) ?? [];
        $body = array_merge($_POST, is_array($jsonBody) ? $jsonBody : []);

        $request = [
            'method'  => $method,
            'uri'     => $uri,
            'query'   => $_GET,
            'body'    => $body,
            'headers' => getallheaders() ?: [],
            'user'    => null,
        ];

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $routePath = preg_replace('#^/api/#', '/', $route['path']);
            $routePath = '/' . trim($routePath, '/');
            if ($routePath === '') {
                $routePath = '/';
            }

            // Convert {param} to regex pattern
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $routePath);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                $params = [];
                foreach ($matches as $key => $val) {
                    if (is_string($key)) {
                        $params[$key] = urldecode($val);
                    }
                }

                // Run Middlewares
                foreach ($route['middlewares'] as $middleware) {
                    if (is_callable($middleware)) {
                        $request = $middleware($request);
                    } elseif (is_array($middleware) && method_exists($middleware[0], $middleware[1])) {
                        $request = call_user_func($middleware, $request);
                    }
                }

                // Execute Handler
                $handler = $route['handler'];
                if (is_callable($handler)) {
                    $handler($params, $request);
                    return;
                } elseif (is_array($handler) && count($handler) === 2) {
                    [$class, $action] = $handler;
                    $controller = new $class();
                    $controller->$action($params, $request);
                    return;
                }
            }
        }

        Response::notFound("Endpoint {$method} {$uri} not found");
    }
}
