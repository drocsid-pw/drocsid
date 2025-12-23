package com.drocsid.grpc.mappings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "mapping")
public class UserCallerMapping {

    @Id
    @Column(name = "map_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_id")
    private String tokenId;

    @Column(name = "caller_id", unique = true, nullable = false)
    private BigInteger callerId;
}
