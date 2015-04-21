<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Commitment api controller.
 *
 * @uri /api/commitments/{commitmentKey}
 */
class Api_Commitments_Commitment extends Core\Resource
{
    /**
     * @method GET
     */
    public function showCommitmentInfo($commitmentKey)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];
        $commitment = $db->commitments->findOne(array(
            '_id' => $commitmentKey
        ));

        if ($commitment) {
            return new Core\JsonResponse(Response::OK, $commitment);
        } else {
            return new Core\JsonResponse(
                Response::NOTFOUND,
                array(
                    'message' => 'Commitment Plan with id "' . $commitmentKey . '" can\'t be found.'
                )
            );
        }
    }

    /**
     * @method PUT
     */
    public function saveCommitment($commitmentKey)
    {
        $plan = $this->request->getDecodedData();

        if ($plan) {
            unset($plan['id']);
            unset($plan['expansion']);

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->commitments->save($plan);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Commitment Plan has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Commitment Plan data can\'t be found in the request.'
            ));
        }

        return $response;
    }
}