<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\ConfigRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Config API controller.
 *
 * @uri /api/configs
 */
class Api_Configs extends Core\Resource
{
    /**
     * @method POST
     */
    public function createConfig($projectKey = null)
    {
        $requestData = $this->request->getDecodedData();

        if (isset($requestData['config'])) {
            ConfigRepository::save($requestData['config']);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Configuration has been created.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::NOTFOUND, array(
                'message' => 'Data was not found in the request.'
            ));
        }

        return $response;
    }
}