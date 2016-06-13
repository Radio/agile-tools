<?php

namespace Radio\Core;

use MongoDB\Client;
use MongoDB\Database;
use MongoDB\Exception\BadMethodCallException;
use MongoDB\InsertOneResult;
use MongoDB\Model\BSONDocument;
use MongoDB\UpdateResult;
use Radio\MongoDB\Helper;

abstract class AbstractRepository
{
    /** @var \MongoDB\Database */
    protected static $database;

    /** @var string Collection name */
    protected static $collectionName;

    /** @var string Name of ID field. */
    protected static $idField = '_id';

    /**
     * @param \MongoDB\Database $database
     */
    public static function setDatabase(Database $database)
    {
        self::$database = $database;
    }

    /**
     * Load one document.
     *
     * @param mixed       $id     Document ID.
     * @param string|null $field  Alternative ID field.
     *
     * @return array
     */
    public static function load($id, $field = null)
    {
        if (!static::$collectionName) {
            throw new BadMethodCallException('load() should not be called for an abstract repository.');
        }
        /** @var BSONDocument|null $document */
        $document = static::$database->{static::$collectionName}->findOne([
            $field ?: static::$idField => $id
        ]);
        if ($document) {
            $document = Helper::bsonToArray($document);
        }
        return $document;
    }

    /**
     * Add or update document.
     *
     * @param array|\ArrayObject $document
     *
     * @return UpdateResult
     */
    public static function save($document)
    {
        if (!static::$collectionName) {
            throw new BadMethodCallException('save() should not be called for an abstract repository.');
        }
        return static::update($document);
    }

    /**
     * Add document.
     *
     * @param $document
     *
     * @return InsertOneResult
     */
    public static function add($document)
    {
        if (!static::$collectionName) {
            throw new BadMethodCallException('add() should not be called for an abstract repository.');
        }
        return static::insert($document);
    }

    /**
     * Get mongo collection instance.
     *
     * @return \MongoDB\Collection
     */
    public static function getCollection()
    {
        return static::$database->{static::$collectionName};
    }

    /**
     * @param array|\ArrayObject $document
     *
     * @return InsertOneResult
     */
    protected static function insert($document)
    {
        return static::$database->{static::$collectionName}->insertOne($document);
    }

    /**
     * @param array|\ArrayObject $document
     *
     * @return UpdateResult
     */
    protected static function update($document)
    {
        $data = $document instanceof \ArrayObject ? $document->getArrayCopy() : $document;
        $id = $data[static::$idField];
        return static::$database->{static::$collectionName}->replaceOne(
            [static::$idField => $id],
            $data,
            ['upsert' => true]
        );
    }
}