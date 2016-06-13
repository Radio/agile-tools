<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\IssueRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Issues controller.
 *
 * @uri /api/issues
 * @param project
 * @param type
 * @param status
 * @param version
 * @param assignee
 */
class Api_Issues extends Core\Resource
{
    /**
     * @method GET
     */
    public function listIssues()
    {
        /** @var \MongoDB\Driver\Cursor $cursor */
        $cursor = $this->applyFilters(IssueRepository::getCollection());

        $issues = iterator_to_array($cursor, false);

        return new Core\JsonResponse(
            Response::OK,
            $issues
        );
    }

    /**
     * @param \MongoDB\Collection $issues
     *
     * @return \MongoDB\Driver\Cursor
     */
    protected function applyFilters(\MongoDB\Collection $issues)
    {
        $filter = array();
        if ($this->request->query('project')) {
            $filter['project'] = $this->request->query('project');
        }
        if ($this->request->query('type')) {
            $filter['issuetype.name'] = $this->request->query('type');
        }
        if ($this->request->query('status')) {
            $filter['status.name'] = $this->request->query('status');
        }
        if ($this->request->query('version')) {
            $filter['versions.name'] = $this->request->query('version');
        }
        if ($this->request->query('assignee')) {
            $filter['assignee.key'] = $this->request->query('assignee');
        }

        return $issues->find($filter);
    }
}