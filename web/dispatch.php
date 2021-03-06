<?php

$backendRoot = '../backend/';

if (is_readable('preconf.php')) {
    require 'preconf.php';
}
if (!is_writable($backendRoot . 'var')) {
    header('HTTP/1.0 500 Internal Server Error');
    die('Var folder is not writable.');
}

require_once $backendRoot . 'vendor/autoload.php';

use Tonic\Application;
use Tonic\Response;
use Radio\Core\Request;

session_start();

$container = require_once 'container.php';

$config = array(
    'load' => array(
        $container['dir.src'] . '/Radio/Controllers/*.php',
        $container['dir.src'] . '/Radio/Controllers/*/*.php',
        $container['dir.src'] . '/Radio/Controllers/*/*/*.php',
        $container['dir.src'] . '/Radio/Controllers/*/*/*/*.php',
        $container['dir.src'] . '/Radio/Controllers/*/*/*/*/*.php',
    ),
);

$app = new Application($config);
$app->container = $container;

\Radio\Core\AbstractRepository::setDatabase($container['database']);

$request = new Request();

try {
    /** @var \Tonic\Resource $resource */
    $resource = $app->getResource($request);
    /** @var \Tonic\Response $response */
    $response = $resource->exec();

} catch (chobie\Jira\Api\UnauthorizedException $e) {

    $response = new Response(Response::FOUND, $e->getMessage(), array(
        'Location' => '/login'
    ));

} catch (chobie\Jira\Api\Exception $e) {

    $response = new Response(Response::SERVICEUNAVAILABLE, $e->getMessage());

} catch (Tonic\NotFoundException $e) {

    $response = new Response(Response::NOTFOUND, $e->getMessage());

} catch (Tonic\UnauthorizedException $e) {

    $response = new Response(Response::UNAUTHORIZED, $e->getMessage());
    $response->wwwAuthenticate = 'Basic realm="My Realm"';

} catch (Tonic\MethodNotAllowedException $e) {

    $response = new Response($e->getCode(), $e->getMessage());
    $response->allow = implode(', ', $resource->allowedMethods());

} catch (Tonic\Exception $e) {

    $response = new Response($e->getCode(), $e->getMessage());
}

$response->output();