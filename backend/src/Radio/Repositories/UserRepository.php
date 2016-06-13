<?php

namespace Radio\Repositories;

use Radio\Core\AbstractRepository;

abstract class UserRepository extends AbstractRepository
{
    protected static $collectionName = 'users';
}