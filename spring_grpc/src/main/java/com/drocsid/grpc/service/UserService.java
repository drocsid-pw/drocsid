package com.drocsid.grpc.service;
import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import java.math.BigInteger;

@GrpcService
public class UserService extends UserServiceGrpc.UserServiceImplBase {

    private final CoreClient coreClient;
    private final JwtAuthService jwtAuthService;

    public UserService(CoreClient coreClient, JwtAuthService jwtAuthService) {
        this.coreClient = coreClient;
        this.jwtAuthService = jwtAuthService;
    }

    @Override
    public void createUser(CreateUserRequest request, StreamObserver<User> responseObserver) {
        try {
            User user = coreClient.createUser(request);

            responseObserver.onNext(user);
            responseObserver.onCompleted();
        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getUser(UserId userIdObj, StreamObserver<User> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(userIdObj.getToken());
            User user = coreClient.getUser(new BigInteger(userId));

            responseObserver.onNext(user);
            responseObserver.onCompleted();
        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void updateUser(UpdateUserRequest request, StreamObserver<User> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            User user = coreClient.updateUser(new CoreUpdateUserRequest(userId, request));

            responseObserver.onNext(user);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void deleteUser(UserId userIdObj, StreamObserver<ResponseMessage> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(userIdObj.getToken());
            coreClient.deleteUser(new BigInteger(userId));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("User deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }
}
