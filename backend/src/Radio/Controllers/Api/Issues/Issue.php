<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\IssueRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Issue api controller.
 *
 * @uri /api/issues/{issueKey}
 */
class Api_Issues_Issue extends Core\Resource
{
    /**
     * @method GET
     */
    public function showIssueInfo($issueKey)
    {
        $issue = IssueRepository::load($issueKey);
        $response = new Core\JsonResponse();
        if ($issue) {
            $response->code = Response::OK;
            $response->body = $issue;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = array(
                'message' => 'Issue with id "' . $issueKey . '" can\'t be found'
            );
        }
        return $response;
    }
}