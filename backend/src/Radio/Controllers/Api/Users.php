<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Repositories\UserRepository;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Users controller.
 *
 * @uri /api/users
 */
class Api_Users extends Core\Resource
{
    protected $allowedSortingFields = array(
        'key', 'name'
    );

    /**
     * @method GET
     */
    public function listUsers()
    {
        /** @var \MongoDB\Driver\Cursor $cursor */
        $cursor = UserRepository::getCollection()->find();
        $this->applySorting($cursor);

        $users = iterator_to_array($cursor, false);

        return new Core\JsonResponse(
            Response::OK,
            $users
        );
    }

    protected function applySorting(\MongoDB\Driver\Cursor $cursor)
    {
        $sort = $this->request->query('sort');
        $fields = $sort ? explode(',', $sort) : array();

        $allowedFields = array();
        foreach ($fields as $field) {
            if (in_array($field, $this->allowedSortingFields)) {
                $allowedFields[$field] = 1;
            }
        }

        if ($allowedFields) {
            $cursor->sort($allowedFields);
        }
    }
}