<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\ProjectRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Import project controller.
 *
 * @uri /api/projects/{projectKey}
 */
class Api_Projects_Project extends Core\Resource
{
    /**
     * @method GET
     */
    public function showProjectInfo($projectKey)
    {
        $project = ProjectRepository::load($projectKey);

        $response = new Core\JsonResponse();
        if ($project) {
            $response->code = Response::OK;
            $response->body = $project;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = array(
                'message' => 'Project with id "' . $projectKey . '" can\'t be found'
            );
        }
        return $response;
    }

    /**
     * @method PUT
     */
    public function saveProject($projectKey)
    {
        $project = $this->request->getDecodedData();

        if ($project) {
            unset($project['id']);
            unset($project['expansion']);

            ProjectRepository::save($project);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Project has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Project data can\'t be found in the request.'
            ));
        }

        return $response;
    }
}