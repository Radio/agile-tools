<?php

namespace Radio\MongoDB;

abstract class Helper
{
    /**
     * A workaround for bug: https://jira.mongodb.org/browse/PHPLIB-185
     *
     * @param \ArrayObject $document
     *
     * @return array
     */
    public static function bsonToArray(\ArrayObject $document)
    {
        $arrayCopy = $document->getArrayCopy();
        self::convertArrayRecursively($arrayCopy);

        return $arrayCopy;
    }

    public static function bsonCollectionToArray(\MongoDB\Driver\Cursor $documents)
    {
        $arrayCopy = iterator_to_array($documents);
        array_walk($arrayCopy, function(&$item) {
            if ($item instanceof \ArrayObject) {
                $item = self::bsonToArray($item);
            }
        });
        return $arrayCopy;
    }

    public static function convertArrayRecursively(&$array)
    {
        array_walk($array, function(&$item) {
            if ($item instanceof \ArrayObject) {
                $item = $item->getArrayCopy();
            }
            if (is_array($item)) {
                self::convertArrayRecursively($item);
            }
        });
    }
}