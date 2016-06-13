<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\ResourcePlanRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * ResourcesPlan api controller.
 *
 * @uri /api/resources_plans/{resourcesPlanKey}
 */
class Api_ResourcesPlans_ResourcesPlan extends Core\Resource
{
    /**
     * @method GET
     */
    public function showResourcesPlanInfo($resourcesPlanKey)
    {
        $resourcesPlan = ResourcePlanRepository::load($resourcesPlanKey);
        if ($resourcesPlan) {
            return new Core\JsonResponse(Response::OK, $resourcesPlan);
        } else {
            return new Core\JsonResponse(
                Response::NOTFOUND,
                array(
                    'message' => 'Resources Plan with id "' . $resourcesPlanKey . '" can\'t be found.'
                )
            );
        }
    }

    /**
     * @method PUT
     */
    public function saveResourcesPlan($resourcesPlanKey)
    {
        $plan = $this->request->getDecodedData();

        if ($plan) {
            unset($plan['id']);
            unset($plan['expansion']);

            ResourcePlanRepository::save($plan);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Resources Plan has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Resources Plan data can\'t be found in the request.'
            ));
        }

        return $response;
    }
}