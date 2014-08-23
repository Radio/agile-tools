<?php
require_once '../vendor/autoload.php';

use Tonic\Application;
use Tonic\Response;
use Tonic\Request;

$container = require_once 'container.php';

$config = array(
    'load' => array(
        $container['dir.src'] . '/Radio/Controller/*.php',
        $container['dir.src'] . '/Radio/Controller/*/*.php',
    ),
);

$app = new Application($config);
$app->container = $container;

$request = new Request();

try {
    /** @var \Tonic\Resource $resource */
    $resource = $app->getResource($request);
    /** @var \Tonic\Response $response */
    $response = $resource->exec();

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