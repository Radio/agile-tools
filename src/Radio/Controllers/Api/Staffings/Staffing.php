<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Staffing api controller.
 *
 * @uri /api/staffings/{staffingKey}
 */
class Api_Staffings_Staffing extends Core\Resource
{
    /**
     * @method GET
     */
    public function showStaffingInfo($staffingKey)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];
        $staffing = $db->staffings->findOne(array(
            '_id' => $staffingKey
        ));

        if ($staffing) {
            $this->expandPlan($staffing);

            return new Core\JsonResponse(
                Response::OK,
                $staffing
            );
        } else {
            return new Core\JsonResponse(
                Response::NOTFOUND,
                array(
                    'message' => 'Staffing with id "' . $staffingKey . '" can\'t be found.'
                )
            );
        }
    }

    /**
     * @method PUT
     */
    public function saveStaffing($staffingKey)
    {
        $staffing = $this->request->getDecodedData();

        if ($staffing) {
            unset($staffing['id']);
            unset($staffing['expansion']);

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->staffings->save($staffing);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Staffing has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Staffing data can\'t be found in the request.'
            ));
        }

        return $response;
    }

    protected function expandPlan(&$report)
    {
        /*
        $expand = $this->request->query('expand');
        if ($expand) {
            $report['expansion'] = array();
            $fields = explode(',', $expand);
            foreach($fields as $field) {

            }
        }
        */
    }
}