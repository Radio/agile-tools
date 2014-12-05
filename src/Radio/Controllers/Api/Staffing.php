<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Projects controller.
 *
 * @uri /api/staffings
 */
class Api_Staffings extends Core\Resource
{
    /**
     * @method POST
     */
    public function addPlan()
    {
        $staffing = json_decode($this->request->data, true);

        if ($staffing) {

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];

            try {
                $db->staffings->insert($staffing);
                return new Core\JsonResponse(Response::OK, array(
                    'message' => 'Staffing has been added.'
                ));
            } catch (\MongoDuplicateKeyException $e) {
                return new Core\JsonResponse(Response::FORBIDDEN, array(
                    'message' => 'Such staffing already exists.'
                ));
            }
        } else {
            return new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Data is not found in request.'
            ));
        }
    }
}