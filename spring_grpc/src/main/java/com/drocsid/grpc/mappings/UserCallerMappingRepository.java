package com.drocsid.grpc.mappings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.Optional;

@Repository
public interface UserCallerMappingRepository extends JpaRepository<UserCallerMapping, Long> {

    Optional<UserCallerMapping> findByCallerId(BigInteger callerId);

    Optional<UserCallerMapping> findByTokenId(String tokenId);
}
