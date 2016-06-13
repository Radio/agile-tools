<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\ProjectRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Projects controller.
 *
 * @uri /api/projects
 */
class Api_Projects extends Core\Resource
{
    /**
     * @method GET
     */
    public function listProjects()
    {
        /** @var \MongoDB\Driver\Cursor $cursor */
        $cursor = $this->applyFilters(ProjectRepository::getCollection());

        $projects = iterator_to_array($cursor, false);

        return new Core\JsonResponse(
            Response::OK,
            $projects
        );
    }


    /**
     * @param \MongoDB\Collection $projects
     *
     * @return \MongoDB\Driver\Cursor
     */
    protected function applyFilters(\MongoDB\Collection $projects)
    {
        $filter = array();
        $projection = array();
        if ($this->request->query('user')) {
            $filter['users.key'] = $this->request->query('user');
        }
        if ($this->request->query('_fields')) {
            $fields = explode(',', $this->request->query('_fields'));
            foreach ($fields as $field) {
                $projection[trim($field)] = 1;
            }
        }

        return $projects->find($filter, $projection);
    }
}