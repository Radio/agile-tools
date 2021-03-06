<?php

namespace Radio\Controllers;

use Radio\Adapters;
use Radio\Core;
use Radio\Repositories\UserRepository;
use Tonic\Response;

/**
 * Import user controller.
 *
 * @uri /api/users/import
 */
class Api_Users_Import extends Core\Resource
{
    /**
     * @method POST
     */
    public function importUser()
    {
        $requestData = $this->request->getDecodedData();

        if (isset($requestData['name'])) {
            /** @var Core\Jira_Api $jiraApi */
            $jiraApi = $this->app->container['jira.api'];
            $jiraUser = $jiraApi->getUser($requestData['name']);

            $adapter = new Adapters\Jira_User($jiraUser);
            $user = $adapter->getAdaptation();

            UserRepository::save($user);

            return new Core\JsonResponse(
                Response::OK,
                array(
                    'message' => 'User ' . $user['name'] . ' has been imported.'
                )
            );
        }
        return new Core\JsonResponse(
            Response::BADREQUEST,
            array(
                'message' => 'User key is not defined.'
            )
        );
    }
}