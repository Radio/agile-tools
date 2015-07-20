<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Commitments api controller.
 *
 * @uri /api/commitments
 */
class Api_Commitments extends Core\Resource
{
    /**
     * @method POST
     */
    public function addPlan()
    {
        $plan = json_decode($this->request->data, true);

        if ($plan) {

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];

            try {
                $db->commitments->insert($plan);
                return new Core\JsonResponse(Response::OK, array(
                    'message' => 'Commitment Plan has been added.'
                ));
            } catch (\MongoDuplicateKeyException $e) {
                return new Core\JsonResponse(Response::FORBIDDEN, array(
                    'message' => 'Such plan already exists.'
                ));
            }
        } else {
            return new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Data is not found in request.'
            ));
        }
    }
}